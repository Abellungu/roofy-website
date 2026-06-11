/* Generic content CRUD: list / edit / save / delete / reorder for every
 * descriptor-driven type. Every successful mutation = one git commit. */
const express = require('express');
const D = require('../descriptors');
const store = require('../lib/store');
const gitops = require('../lib/gitops');
const { audit } = require('../lib/audit');
const H = require('../lib/html');

const router = express.Router();

function loadDesc(req, res, next) {
    const desc = D.descriptor(req.params.type);
    if (!desc) return res.status(404).send('unknown content type');
    req.desc = desc;
    next();
}

/* ── pages ── */

router.get('/c/:type', loadDesc, function (req, res) {
    const desc = req.desc;
    const { json, sha } = store.readFile(desc.file);
    const items = D.listItems(desc, json);
    const actions = desc.kind === 'collection'
        ? `<a class="btn-primary" href="${req.baseUrl}/c/${desc.key}/new">+ ${H.esc(desc.labelZh)}新建 New</a>`
        : '';
    res.send(H.layout({
        base: req.baseUrl, active: 'c/' + desc.key, user: req.adminUser,
        title: desc.labelZh, titleEn: desc.labelEn,
        actions,
        body: H.renderList(desc, items, { base: req.baseUrl, baseSha: sha, assetBase: req.baseUrl + '/site-assets' })
    }));
});

router.get('/c/:type/new', loadDesc, function (req, res) {
    const desc = req.desc;
    if (desc.kind !== 'collection') return res.redirect(req.baseUrl + '/c/' + desc.key);
    const { sha } = store.readFile(desc.file);
    res.send(H.layout({
        base: req.baseUrl, active: 'c/' + desc.key, user: req.adminUser,
        title: desc.labelZh + ' · 新建', titleEn: desc.labelEn + ' · New',
        body: H.renderForm(desc, null, {
            isNew: true, baseSha: sha,
            backHref: req.baseUrl + '/c/' + desc.key,
            assetBase: req.baseUrl + '/site-assets'
        })
    }));
});

router.get('/c/:type/:id', loadDesc, function (req, res) {
    const desc = req.desc;
    const { json, sha } = store.readFile(desc.file);
    let item = D.getItem(desc, json, req.params.id);
    if (!item) return res.status(404).send('item not found');
    if (desc.prepareForm) item = desc.prepareForm(item);
    res.send(H.layout({
        base: req.baseUrl, active: 'c/' + desc.key, user: req.adminUser,
        title: desc.labelZh + ' · 编辑', titleEn: desc.labelEn + ' · Edit',
        body: H.renderForm(desc, item, {
            isNew: false, baseSha: sha,
            backHref: req.baseUrl + '/c/' + desc.key,
            assetBase: req.baseUrl + '/site-assets'
        })
    }));
});

/* ── mutations ── */

router.post('/api/c/:type/save', loadDesc, function (req, res) {
    const desc = req.desc;
    const { id, isNew, data, baseSha } = req.body || {};
    const v = D.validateItem(desc, data || {});
    if (v.errors.length) return res.json({ ok: false, errors: v.errors, warnings: v.warnings });

    let fileSha;
    try {
        const { json } = store.readFile(desc.file);
        if (desc.putItem) {                                  /* fixed virtual collections (legal) */
            if (!D.getItem(desc, json, id)) return res.json({ ok: false, errors: ['unknown item'] });
            desc.putItem(json, id, v.clean);
        } else {
            const arr = json[desc.listKey];
            const targetId = isNew ? v.clean.id : id;
            const idx = arr.findIndex(function (x) { return x.id === targetId; });
            if (isNew) {
                if (idx !== -1) return res.json({ ok: false, errors: ['ID 已存在 — this ID already exists'] });
                arr.push(v.clean);
            } else {
                if (idx === -1) return res.json({ ok: false, errors: ['item not found'] });
                v.clean.id = id;                              /* id immutable after creation */
                const merged = desc.applySave
                    ? desc.applySave(arr[idx], v.clean)
                    : Object.assign({}, arr[idx], v.clean);
                arr[idx] = merged;
            }
        }
        fileSha = store.writeFile(desc.file, json, baseSha);
    } catch (e) {
        if (e.code === 'CONFLICT') {
            return res.json({ ok: false, errors: ['文件已被他人修改,请刷新页面后重做 — file changed by someone else; reload and redo'] });
        }
        throw e;
    }

    const itemId = desc.putItem ? id : (isNew ? v.clean.id : id);
    const msg = `admin(${desc.key}): ${isNew ? 'create' : 'update'} ${itemId}`;
    gitops.commitPaths([store.repoRel(require('path').join(store.DATA_DIR, desc.file)), 'site/assets/img'],
        msg, req.adminUser.name, req.adminUser.username + '@roofy-admin.local')
        .then(function (r) {
            audit(req.adminUser.username, 'save', `${desc.key}/${itemId} ${r.committed ? r.sha : 'no-change'}`);
            res.json({ ok: true, id: itemId, newSha: fileSha, warnings: v.warnings, commit: r.sha || null });
        })
        .catch(function (e) {
            res.json({ ok: true, id: itemId, newSha: fileSha, warnings: v.warnings.concat(['已保存但 git 提交失败 saved but git commit failed: ' + e.message]) });
        });
});

router.post('/api/c/:type/delete', loadDesc, function (req, res) {
    const desc = req.desc;
    if (desc.kind !== 'collection') return res.json({ ok: false, errors: ['该类型不可删除条目 — items of this type cannot be deleted'] });
    const { id, baseSha } = req.body || {};
    let fileSha;
    try {
        const { json } = store.readFile(desc.file);
        const arr = json[desc.listKey];
        const idx = arr.findIndex(function (x) { return x.id === id; });
        if (idx === -1) return res.json({ ok: false, errors: ['item not found'] });
        arr.splice(idx, 1);
        fileSha = store.writeFile(desc.file, json, baseSha);
    } catch (e) {
        if (e.code === 'CONFLICT') return res.json({ ok: false, errors: ['文件已被他人修改,请刷新 — file changed; reload'] });
        throw e;
    }
    gitops.commitPaths([store.repoRel(require('path').join(store.DATA_DIR, desc.file))],
        `admin(${desc.key}): delete ${id}`, req.adminUser.name, req.adminUser.username + '@roofy-admin.local')
        .then(function () {
            audit(req.adminUser.username, 'delete', `${desc.key}/${id}`);
            res.json({ ok: true, newSha: fileSha });
        })
        .catch(function (e) { res.json({ ok: true, newSha: fileSha, warnings: ['git: ' + e.message] }); });
});

router.post('/api/c/:type/reorder', loadDesc, function (req, res) {
    const desc = req.desc;
    if (desc.kind !== 'collection') return res.json({ ok: false, errors: ['not reorderable'] });
    const { ids, baseSha } = req.body || {};
    let fileSha;
    try {
        const { json } = store.readFile(desc.file);
        const arr = json[desc.listKey];
        if (!Array.isArray(ids) || ids.length !== arr.length ||
            ids.slice().sort().join() !== arr.map(function (x) { return x.id; }).sort().join()) {
            return res.json({ ok: false, errors: ['顺序列表与数据不一致,请刷新 — order list out of sync; reload'] });
        }
        json[desc.listKey] = ids.map(function (id) { return arr.find(function (x) { return x.id === id; }); });
        fileSha = store.writeFile(desc.file, json, baseSha);
    } catch (e) {
        if (e.code === 'CONFLICT') return res.json({ ok: false, errors: ['文件已被他人修改,请刷新 — file changed; reload'] });
        throw e;
    }
    gitops.commitPaths([store.repoRel(require('path').join(store.DATA_DIR, desc.file))],
        `admin(${desc.key}): reorder`, req.adminUser.name, req.adminUser.username + '@roofy-admin.local')
        .then(function () {
            audit(req.adminUser.username, 'reorder', desc.key);
            res.json({ ok: true, newSha: fileSha });
        })
        .catch(function (e) { res.json({ ok: true, newSha: fileSha, warnings: ['git: ' + e.message] }); });
});

module.exports = router;
