/* News draft review queue. AI-summarised candidates land here (from the
 * scheduled fetch or the "Fetch now" button); a human edits, then publishes
 * into news.json or rejects. Publishing is the legal + brand gate — every
 * article a person approves carries source attribution + a link out, and we
 * never reproduce source text/images verbatim (see lib/news-*.js).
 *
 * Server-rendered with plain form POSTs (no dependency on admin.js's content
 * form, whose save endpoint is hardcoded to /api/c/<type>/save). */
const express = require('express');
const path = require('path');
const D = require('../descriptors');
const store = require('../lib/store');
const gitops = require('../lib/gitops');
const drafts = require('../lib/news-drafts');
const pipeline = require('../lib/news-pipeline');
const imageFetch = require('../lib/news-image-fetch');
const prerender = require('../lib/prerender-hook');
const fetcher = require('../lib/news-fetch');
const summarizer = require('../lib/news-summarize');
const { audit } = require('../lib/audit');
const H = require('../lib/html');

const router = express.Router();
const esc = H.esc, L = H.L;

function paras(arr) { return (Array.isArray(arr) ? arr : []).join('\n\n'); }
function splitParas(s) { return String(s || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean); }

/* ── list / review page ── */
router.get('/news-drafts', function (req, res) {
    const pending = drafts.pending().reverse();   // newest first
    const fetchOn = fetcher.enabled();
    const aiOn = summarizer.enabled();
    const bakeOn = prerender.available();

    const setupIssues = [];
    if (!fetchOn) setupIssues.push(L(
        '新闻抓取暂不可用，请联系管理员检查新闻服务。',
        'News fetching is unavailable. Ask an administrator to check the news service.'
    ));
    if (!aiOn) setupIssues.push(L(
        '双语摘要暂不可用，请联系管理员检查摘要服务。',
        'Bilingual summaries are unavailable. Ask an administrator to check the summary service.'
    ));
    if (!bakeOn) setupIssues.push(L(
        '发布后页面暂时不会自动更新，请联系管理员检查发布服务。',
        'Pages will not refresh automatically after publishing. Ask an administrator to check the publishing service.'
    ));
    const status =
        `<div class="hintbox">${L(
            '新抓到的新闻会先放在这里。先看一遍，按需要修改，确认没问题再发布。',
            'New stories wait here for review. Read them through, make any edits, then publish when they are ready.'
        )}</div>` +
        (setupIssues.length ? `<div class="warnbox system-status">${setupIssues.map(function (item) { return `<div>${item}</div>`; }).join('')}</div>` : '');

    const notice = req.query.msg ? `<div class="notice">${esc(req.query.msg)}</div>` : '';

    const cards = pending.map(function (d) {
        const cat = (D.descriptor('news').fields.find(function (f) { return f.name === 'category'; }).options
            .find(function (o) { return o[0] === d.category; }) || [d.category, d.category])[1];
        return `<div class="dcard">
            ${d.coverImg ? `<img class="dcard-img" src="${esc(req.baseUrl + '/site-assets' + d.coverImg)}" alt="" loading="lazy">` : ''}
            <div class="dcard-head">
                <span class="badge">${esc(cat)}</span>
                <span class="badge" style="background:${d.sourceImageUsed ? '#dcfce7;color:#166534' : '#f1f5f9;color:#64748b'}">${d.sourceImageUsed ? L('原图', 'source photo') : L('图库图', 'stock')}</span>
                <span class="dcard-date">${esc(d.publishedAt || '')}</span>
                ${d.source ? `<span class="dcard-src">${esc(d.source)}</span>` : ''}
            </div>
            <h3 class="dcard-title">${esc(d.titleZh || '')}</h3>
            <div class="dcard-title-en">${esc(d.titleEn || '')}</div>
            <p class="dcard-ex">${esc(d.excerptZh || '')}</p>
            <p class="dcard-ex en">${esc(d.excerptEn || '')}</p>
            ${d.sourceUrl ? `<a class="dcard-link" href="${esc(d.sourceUrl)}" target="_blank" rel="noopener noreferrer">${L('查看原文', 'Source')} ↗</a>` : ''}
            <div class="dcard-ops">
                <a class="btn-sm" href="${req.baseUrl}/news-drafts/${esc(d.draftId)}">${L('编辑', 'Edit')}</a>
                <form method="post" action="${req.baseUrl}/news-drafts/${esc(d.draftId)}/publish" style="display:inline">
                    <button class="btn-primary btn-sm" type="submit">${L('通过并发布', 'Approve & publish')}</button>
                </form>
                <form method="post" action="${req.baseUrl}/news-drafts/${esc(d.draftId)}/reject" style="display:inline">
                    <button class="btn-sm danger" type="submit">${L('拒绝', 'Reject')}</button>
                </form>
            </div>
        </div>`;
    }).join('');

    const fetchBtn =
        `<form method="post" action="${req.baseUrl}/news-drafts/fetch" style="display:inline">
            <button class="btn-primary" type="submit"${fetchOn ? '' : ' disabled title="set NEWS_API_KEY first"'}>${L('立即抓取', 'Fetch now')}</button>
        </form>`;

    res.send(H.layout({
        base: req.baseUrl, active: 'news-drafts', user: req.adminUser,
        title: '新闻草稿', titleEn: 'News drafts',
        actions: fetchBtn,
        notice: notice,
        body: status + (pending.length
            ? `<div class="dcards">${cards}</div>`
            : `<div class="empty">${L('暂无待审草稿。点右上角「立即抓取」拉取最新新闻。', 'No drafts pending. Use “Fetch now” (top right) to pull the latest news.')}</div>`)
    }));
});

/* ── edit one draft ── */
router.get('/news-drafts/:draftId', function (req, res) {
    const d = drafts.get(req.params.draftId);
    if (!d || d.status !== 'pending') return res.redirect(req.baseUrl + '/news-drafts');
    const catOpts = D.descriptor('news').fields.find(function (f) { return f.name === 'category'; }).options
        .map(function (o) { return `<option value="${esc(o[0])}"${o[0] === d.category ? ' selected' : ''}>${esc(o[1])}</option>`; }).join('');

    const errBox = req.query.err
        ? `<div class="hintbox" style="background:#fef2f2;border-color:#fecaca;color:#991b1b">${L('无法发布', 'Cannot publish')}: ${esc(req.query.err)}</div>`
        : '';
    const body = errBox + `
    <form method="post" action="${req.baseUrl}/news-drafts/${esc(d.draftId)}/save" class="cform">
        <div class="fgrid">
            <div class="field half"><label class="flabel">${L('分类', 'Category')}</label>
                <select class="inp" name="category">${catOpts}</select></div>
            <div class="field half"><label class="flabel">${L('发布日期', 'Published at')}</label>
                <input class="inp" type="date" name="publishedAt" value="${esc(d.publishedAt || '')}"></div>
            <div class="field half"><label class="flabel">${L('标题(中文)', 'Title zh')}<span class="req">*</span></label>
                <input class="inp" name="titleZh" value="${esc(d.titleZh || '')}"></div>
            <div class="field half"><label class="flabel">${L('标题(英文)', 'Title en')}<span class="req">*</span></label>
                <input class="inp" name="titleEn" value="${esc(d.titleEn || '')}"></div>
            <div class="field half"><label class="flabel">${L('摘要(中文)', 'Excerpt zh')}<span class="req">*</span></label>
                <textarea class="inp ta" name="excerptZh" rows="3">${esc(d.excerptZh || '')}</textarea></div>
            <div class="field half"><label class="flabel">${L('摘要(英文)', 'Excerpt en')}<span class="req">*</span></label>
                <textarea class="inp ta" name="excerptEn" rows="3">${esc(d.excerptEn || '')}</textarea></div>
            <div class="field half"><label class="flabel">${L('正文(中文,空行分段)', 'Body zh (blank line = new paragraph)')}<span class="req">*</span></label>
                <textarea class="inp ta" name="bodyZh" rows="8">${esc(paras(d.bodyZh))}</textarea></div>
            <div class="field half"><label class="flabel">${L('正文(英文,空行分段)', 'Body en (blank line = new paragraph)')}<span class="req">*</span></label>
                <textarea class="inp ta" name="bodyEn" rows="8">${esc(paras(d.bodyEn))}</textarea></div>
            <div class="field half"><label class="flabel">${L('来源', 'Source')}</label>
                <input class="inp" name="source" value="${esc(d.source || '')}"></div>
            <div class="field half"><label class="flabel">${L('来源链接', 'Source URL')}</label>
                <input class="inp" name="sourceUrl" value="${esc(d.sourceUrl || '')}"></div>
            <div class="field full"><label class="flabel">${L('封面图路径', 'Cover image path')}</label>
                <input class="inp mono" name="coverImg" value="${esc(d.coverImg || '')}">
                <div class="fhint">${L('已自动配图(来自本站图库)。如需更换,在「图片库」上传后填入路径,例如 /assets/img/stock/xxx.jpg。', 'Auto-assigned from the site stock library. To change, upload in Media and paste the path, e.g. /assets/img/stock/xxx.jpg.')}</div>
                ${d.coverImg ? `<div class="imgprev" style="margin-top:8px"><img src="${esc(req.baseUrl + '/site-assets' + d.coverImg)}" alt="" style="max-width:240px;border-radius:6px"></div>` : ''}
            </div>
        </div>
        <div class="formbar">
            <button type="submit" class="btn-primary">${L('保存草稿', 'Save draft')}</button>
            <a class="btn-ghost" href="${req.baseUrl}/news-drafts">${L('返回列表', 'Back')}</a>
        </div>
    </form>`;

    res.send(H.layout({
        base: req.baseUrl, active: 'news-drafts', user: req.adminUser,
        title: '编辑新闻草稿', titleEn: 'Edit draft', body: body
    }));
});

router.post('/news-drafts/:draftId/save', function (req, res) {
    const b = req.body || {};
    const patch = {
        category: b.category, publishedAt: b.publishedAt,
        titleZh: b.titleZh, titleEn: b.titleEn,
        excerptZh: b.excerptZh, excerptEn: b.excerptEn,
        bodyZh: splitParas(b.bodyZh), bodyEn: splitParas(b.bodyEn),
        source: b.source, sourceUrl: b.sourceUrl, coverImg: b.coverImg
    };
    drafts.update(req.params.draftId, patch);
    audit(req.adminUser.username, 'news-draft-save', req.params.draftId);
    res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent('草稿已保存 Draft saved'));
});

router.post('/news-drafts/:draftId/reject', function (req, res) {
    const d = drafts.get(req.params.draftId);
    if (d) imageFetch.removeCover(d.coverImg);   // delete the self-hosted source image, if any
    drafts.remove(req.params.draftId);
    audit(req.adminUser.username, 'news-draft-reject', req.params.draftId);
    res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent('草稿已删除 Draft rejected'));
});

/* ── publish a draft into news.json ── */
router.post('/news-drafts/:draftId/publish', async function (req, res) {
    const d = drafts.get(req.params.draftId);
    if (!d || d.status !== 'pending') return res.redirect(req.baseUrl + '/news-drafts');
    const desc = D.descriptor('news');

    const data = {};
    drafts.ARTICLE_FIELDS.forEach(function (f) { data[f] = d[f]; });
    data.placeholder = false;

    const v = D.validateItem(desc, data);
    if (v.errors.length) {
        return res.redirect(req.baseUrl + '/news-drafts/' + encodeURIComponent(d.draftId) +
            '?err=' + encodeURIComponent(v.errors.join('; ')));
    }

    /* insert into news.json (fresh read for optimistic-lock baseSha) */
    let fileSha;
    try {
        const cur = store.readFile(desc.file);
        const arr = cur.json[desc.listKey];
        if (arr.some(function (x) { return x.id === v.clean.id; })) {
            return res.redirect(req.baseUrl + '/news-drafts/' + encodeURIComponent(d.draftId) +
                '?err=' + encodeURIComponent('ID 已存在,请改 ID — id already exists'));
        }
        arr.push(v.clean);
        fileSha = store.writeFile(desc.file, cur.json, cur.sha);
    } catch (e) {
        return res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent('发布失败 publish failed: ' + e.message));
    }

    /* re-bake the prerendered HTML so the crawlable home + news pages update */
    const baked = await prerender.run();

    const paths = [store.repoRel(path.join(store.DATA_DIR, desc.file)), 'site/assets/img/news'];
    if (baked.ok) paths.push('site/index.html', 'site/news/index.html');

    try {
        const r = await gitops.commitPaths(paths, 'admin(news): publish ' + v.clean.id + (baked.ok ? ' + prerender' : ''),
            req.adminUser.name, req.adminUser.username + '@roofy-admin.local');
        drafts.remove(d.draftId);
        audit(req.adminUser.username, 'news-draft-publish', v.clean.id + ' ' + (r.sha || '') + (baked.ok ? '' : ' (no-bake)'));
        res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent('已发布 Published: ' + v.clean.id +
            (baked.ok ? ' (静态页已重建)' : ' ⚠️ 静态页未重建,需在 repo 根目录 npm install 后重跑 prerender')));
    } catch (e) {
        drafts.remove(d.draftId);
        res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent('已写入但 git 提交失败 saved but git failed: ' + e.message));
    }
});

/* ── manual fetch trigger ── */
router.post('/news-drafts/fetch', async function (req, res) {
    let result;
    try {
        result = await pipeline.run({ limit: 8 });
    } catch (e) {
        return res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent('抓取出错 fetch error: ' + e.message));
    }
    audit(req.adminUser.username, 'news-fetch', JSON.stringify(result));
    const msg = result.added
        ? `抓取完成:新增 ${result.added} 条草稿(跳过 ${result.skipped},失败 ${result.errors})`
        : `未新增草稿:${result.reason || '无'}`;
    res.redirect(req.baseUrl + '/news-drafts?msg=' + encodeURIComponent(msg));
});

module.exports = router;
