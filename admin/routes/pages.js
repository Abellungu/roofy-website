/* Standalone pages: dashboard, media, history, settings, account. */
const express = require('express');
const D = require('../descriptors');
const store = require('../lib/store');
const gitops = require('../lib/gitops');
const uploads = require('../lib/uploads');
const auth = require('../lib/auth');
const leads = require('../lib/leads');
const { audit, tail } = require('../lib/audit');
const H = require('../lib/html');

const router = express.Router();

/* ── dashboard ── */
router.get('/', async function (req, res) {
    const cards = D.allDescriptors().map(function (desc) {
        let count = '—';
        try {
            const { json } = store.readFile(desc.file);
            count = String(D.listItems(desc, json).length);
        } catch (e) { /* keep dash */ }
        return `<a class="card stat" href="${req.baseUrl}/c/${desc.key}">
            <div class="stat-ic"><i data-lucide="${desc.icon}"></i></div>
            <div class="stat-n">${count}</div>
            <div class="stat-l">${H.L(desc.labelZh, desc.labelEn)}</div></a>`;
    }).join('');

    let commits = [];
    try { commits = await gitops.log(['site'], 8); } catch (e) { /* empty */ }
    const head = await gitops.headInfo();
    const commitRows = commits.map(function (c) {
        return `<tr><td class="mono">${H.esc(c.sha)}</td><td>${H.esc(c.subject)}</td><td>${H.esc(c.author)}</td><td>${H.esc(c.date)}</td></tr>`;
    }).join('');

    const audits = tail(6).map(function (a) {
        return `<tr><td>${H.esc(a.at.replace('T', ' ').slice(0, 16))}</td><td>${H.esc(a.user)}</td><td>${H.esc(a.action)}</td><td>${H.esc(a.detail)}</td></tr>`;
    }).join('');

    res.send(H.layout({
        base: req.baseUrl, active: 'dashboard', user: req.adminUser,
        title: '概览', titleEn: 'Dashboard',
        body: `
        <div class="hintbox">${H.L(
            '品牌红线:公司 2024 年成立,不编造数字与评价;LED 业务只展示真实点位与真实产品;「物业开发」一律写「代建」;保存即上线,改错可在「发布历史」回滚。',
            'Brand rules: founded 2024 — no fabricated stats or testimonials; LED shows real sites and products only; always 代建 / Turnkey Development; saves go live immediately and can be rolled back under History.')}</div>
        <div class="cards">${cards}</div>
        <div class="panel"><h2>${H.L('最近发布', 'Recent publishes')} <span class="mono dim">HEAD ${H.esc(head.sha)} · 待推送 unpushed: ${H.esc(head.ahead)}</span></h2>
            <div class="tablewrap"><table class="ltable"><thead><tr><th>commit</th><th>${H.L('内容', 'Subject')}</th><th>${H.L('操作人', 'By')}</th><th>${H.L('时间', 'When')}</th></tr></thead>
            <tbody>${commitRows || '<tr><td colspan="4">—</td></tr>'}</tbody></table></div></div>
        <div class="panel"><h2>${H.L('操作日志', 'Audit log')}</h2>
            <div class="tablewrap"><table class="ltable"><thead><tr><th>${H.L('时间', 'When')}</th><th>${H.L('用户', 'User')}</th><th>${H.L('动作', 'Action')}</th><th>${H.L('详情', 'Detail')}</th></tr></thead>
            <tbody>${audits || '<tr><td colspan="4">—</td></tr>'}</tbody></table></div></div>`
    }));
});

/* ── media library ── */
router.get('/media', function (req, res) {
    const folder = String(req.query.folder || '');
    const images = uploads.listImages(folder);
    const tabs = [''].concat(uploads.FOLDERS).map(function (f) {
        const label = f === '' ? '全部 All' : f;
        const active = f === folder ? ' active' : '';
        return `<a class="tab${active}" href="${req.baseUrl}/media${f ? '?folder=' + f : ''}">${H.esc(label)}</a>`;
    }).join('');
    const grid = images.map(function (im) {
        return `<div class="mcell" data-path="${H.esc(im.path)}">
            <img src="${req.baseUrl}/site-assets${H.esc(im.path)}" loading="lazy" alt="">
            <div class="mmeta"><span class="mono">${H.esc(im.name)}</span><span>${Math.round(im.size / 1024)}KB</span></div>
            <div class="mops">
                <button class="btn-sm act-copy" data-copy="${H.esc(im.path)}">${H.L('复制路径', 'Copy path')}</button>
                <button class="btn-sm danger act-media-del">${H.L('删除', 'Delete')}</button>
            </div></div>`;
    }).join('');
    res.send(H.layout({
        base: req.baseUrl, active: 'media', user: req.adminUser,
        title: '图片库', titleEn: 'Media library',
        actions: `<label class="btn-primary upl"><input type="file" id="media-upload" accept="image/*" multiple hidden data-folder="${H.esc(folder || 'misc')}">+ ${H.L('上传图片', 'Upload')}</label>`,
        body: `<div class="hintbox">${H.L('上传自动压缩为最长边 1600px 的 JPG。被内容引用的图片无法删除。当前上传目录:' + (folder || 'misc'), 'Uploads are recompressed to ≤1600px JPG. Images referenced by content cannot be deleted. Current upload folder: ' + (folder || 'misc'))}</div>
        <div class="tabs">${tabs}</div>
        <div class="mgrid" id="media-grid">${grid || '<div class="empty">空 empty</div>'}</div>`
    }));
});

/* ── history ── */
router.get('/history', async function (req, res) {
    let commits = [];
    try { commits = await gitops.log(['site/assets/data', 'site/assets/js/settings.js'], 50); } catch (e) { /* empty */ }
    const withFiles = [];
    for (const c of commits) {
        let files = [];
        try {
            files = (await gitops.commitFiles(c.sha)).filter(function (f) {
                return /^site\/assets\/(data\/|js\/settings\.js)/.test(f);
            });
        } catch (e) { /* skip */ }
        withFiles.push(Object.assign({ files }, c));
    }
    const rows = withFiles.map(function (c) {
        const fileBtns = c.files.map(function (f) {
            const short = f.replace('site/assets/data/', '').replace('site/assets/js/', '');
            return `<button class="btn-sm act-restore" data-sha="${H.esc(c.sha)}" data-file="${H.esc(f)}"
                title="把 ${H.esc(short)} 恢复到该版本 restore ${H.esc(short)} to this commit">⟲ ${H.esc(short)}</button>`;
        }).join(' ');
        return `<tr><td class="mono">${H.esc(c.sha)}</td><td>${H.esc(c.subject)}</td>
            <td>${H.esc(c.author)}</td><td>${H.esc(c.date)}</td><td>${fileBtns || '—'}</td></tr>`;
    }).join('');
    res.send(H.layout({
        base: req.baseUrl, active: 'history', user: req.adminUser,
        title: '发布历史', titleEn: 'Publish history',
        body: `<div class="hintbox">${H.L('每次保存都是一个版本。点击 ⟲ 可把单个数据文件恢复到那个版本的内容(恢复本身也会成为一条新记录,不会丢失任何历史)。',
            'Every save is a version. Click ⟲ to restore a single data file to that commit — the restore is itself a new commit, so nothing is ever lost.')}</div>
        <div class="tablewrap"><table class="ltable" id="history-table"><thead>
        <tr><th>commit</th><th>${H.L('内容', 'Subject')}</th><th>${H.L('操作人', 'By')}</th><th>${H.L('时间', 'When')}</th><th>${H.L('恢复文件', 'Restore file')}</th></tr>
        </thead><tbody>${rows || '<tr><td colspan="5">—</td></tr>'}</tbody></table></div>`
    }));
});

/* ── settings ── */
router.get('/settings', function (req, res) {
    const { json: s, sha } = store.readSettings();
    function inp(name, label, labelEn, value, hint) {
        return `<div class="field full"><label class="flabel">${H.L(label, labelEn)}</label>
            <input class="inp" name="${name}" value="${H.esc(value)}">${hint ? `<div class="fhint">${H.esc(hint)}</div>` : ''}</div>`;
    }
    res.send(H.layout({
        base: req.baseUrl, active: 'settings', user: req.adminUser,
        title: '站点设置', titleEn: 'Site settings',
        body: `<div class="hintbox">${H.L('这些设置保存后写入 settings.js 并立即对全站生效:WhatsApp 悬浮按钮号码、统计代码、页脚社媒图标(留空的图标不显示)。',
            'Saved values are written to settings.js and apply sitewide immediately: WhatsApp FAB number, analytics IDs, footer social icons (empty = hidden).')}</div>
        <form id="settings-form" class="cform" data-base-sha="${H.esc(sha)}">
        <div class="fgrid">
        ${inp('whatsapp', 'WhatsApp 号码', 'WhatsApp number', s.whatsapp, '含国家码纯数字,如 260964813736 — digits only, with country code')}
        ${inp('ga4Id', 'GA4 衡量 ID', 'GA4 measurement ID', s.ga4Id, 'G-XXXXXXXXXX,留空不启用 — empty disables')}
        ${inp('pixelId', 'Meta Pixel ID', 'Meta Pixel ID', s.pixelId, '纯数字,留空不启用 — empty disables')}
        ${inp('social.instagram', 'Instagram 链接', 'Instagram URL', s.social.instagram, 'https:// 开头,留空隐藏图标')}
        ${inp('social.facebook', 'Facebook 链接', 'Facebook URL', s.social.facebook, '')}
        ${inp('social.linkedin', 'LinkedIn 链接', 'LinkedIn URL', s.social.linkedin, '')}
        ${inp('social.youtube', 'YouTube 链接', 'YouTube URL', s.social.youtube, '')}
        </div>
        <div class="formbar"><button type="submit" class="btn-primary">${H.L('保存并发布', 'Save & publish')}</button><span class="savemsg" id="savemsg"></span></div>
        </form>`
    }));
});

/* ── account ── */
router.get('/account', function (req, res) {
    res.send(H.layout({
        base: req.baseUrl, active: 'account', user: req.adminUser,
        title: '账号', titleEn: 'Account',
        body: `<div class="panel"><h2>${H.L('修改密码', 'Change password')}</h2>
        <form id="password-form" class="cform narrow">
        <div class="field full"><label class="flabel">${H.L('当前密码', 'Current password')}</label><input class="inp" type="password" name="oldPw" autocomplete="current-password"></div>
        <div class="field full"><label class="flabel">${H.L('新密码(至少 10 位)', 'New password (min 10 chars)')}</label><input class="inp" type="password" name="newPw" autocomplete="new-password"></div>
        <div class="field full"><label class="flabel">${H.L('重复新密码', 'Repeat new password')}</label><input class="inp" type="password" name="newPw2" autocomplete="new-password"></div>
        <div class="formbar"><button type="submit" class="btn-primary">${H.L('更新密码', 'Update password')}</button><span class="savemsg" id="savemsg"></span></div>
        </form></div>`
    }));
});

router.post('/api/account/password', function (req, res) {
    const { oldPw, newPw, newPw2 } = req.body || {};
    if (!newPw || newPw !== newPw2) return res.json({ ok: false, errors: ['两次输入的新密码不一致 — new passwords do not match'] });
    if (String(newPw).length < 10) return res.json({ ok: false, errors: ['新密码至少 10 位 — at least 10 characters'] });
    const ok = auth.changePassword(req.adminUser.username, String(oldPw || ''), String(newPw));
    if (!ok) return res.json({ ok: false, errors: ['当前密码不正确 — current password incorrect'] });
    res.json({ ok: true });
});

/* ── leads (public contact-form submissions) ── */
const INTEREST_L = {
    realestate: ['房地产', 'Real estate'], led: ['LED 广告', 'LED ads'],
    branding: ['品牌策划', 'Branding'], other: ['其他', 'Other']
};

router.get('/leads', function (req, res) {
    const list = leads.all().reverse();   // newest first
    const rows = list.map(function (l) {
        const il = INTEREST_L[l.interest] || INTEREST_L.other;
        const when = H.esc((l.at || '').replace('T', ' ').slice(0, 16));
        const phone = l.phone ? `<div class="dim">${H.esc(l.phone)}</div>` : '';
        const wa = l.phone ? ` · <a href="https://wa.me/${H.esc(String(l.phone).replace(/[^\d]/g, ''))}" target="_blank" rel="noopener">WhatsApp</a>` : '';
        return `<tr class="${l.read ? '' : 'lead-unread'}" data-id="${H.esc(l.id)}">
            <td class="nowrap">${when}</td>
            <td><strong>${H.esc(l.name)}</strong></td>
            <td><a href="mailto:${H.esc(l.email)}">${H.esc(l.email)}</a>${phone}${wa}</td>
            <td>${H.L(il[0], il[1])}</td>
            <td style="white-space:pre-line">${H.esc(l.message)}</td>
            <td class="ops"><button class="btn-sm danger act-lead-del">${H.L('删除', 'Delete')}</button></td>
        </tr>`;
    }).join('');
    leads.markAllRead();   // viewing the inbox clears the unread badge
    res.send(H.layout({
        base: req.baseUrl, active: 'leads', user: req.adminUser,
        title: '咨询线索', titleEn: 'Leads',
        body: `<div class="hintbox">${H.L(
            '网站联系表单的提交都会进入这里。这些数据只保存在服务器本地,不进 git、不公开。点邮箱直接回复,或用 WhatsApp 跟进。',
            'Contact-form submissions land here. They are stored only on the server — never committed to git, never public. Click an email to reply, or follow up on WhatsApp.')}</div>
        <div class="tablewrap"><table class="ltable" id="leads-table">
        <thead><tr><th>${H.L('时间', 'When')}</th><th>${H.L('姓名', 'Name')}</th><th>${H.L('联系方式', 'Contact')}</th><th>${H.L('意向', 'Interest')}</th><th>${H.L('留言', 'Message')}</th><th class="ops-col">${H.L('操作', 'Actions')}</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6"><div class="empty">${H.L('暂无线索', 'No leads yet')}</div></td></tr>`}</tbody>
        </table></div>`
    }));
});

router.post('/api/leads/delete', function (req, res) {
    const id = String((req.body || {}).id || '');
    if (!/^[0-9a-f]{8,32}$/.test(id)) return res.json({ ok: false, errors: ['bad id'] });
    try {
        leads.remove(id);
        audit(req.adminUser.username, 'lead-delete', id);
        res.json({ ok: true });
    } catch (e) { res.json({ ok: false, errors: [e.message] }); }
});

module.exports = router;
