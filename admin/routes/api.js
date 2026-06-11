/* Upload + media APIs. */
const express = require('express');
const uploads = require('../lib/uploads');
const gitops = require('../lib/gitops');
const store = require('../lib/store');
const { audit } = require('../lib/audit');

const router = express.Router();

router.post('/api/upload', uploads.upload.array('files', 8), async function (req, res) {
    try {
        const folder = String(req.body.folder || 'misc');
        const out = [];
        for (const f of req.files || []) {
            const r = await uploads.processUpload(f, folder);
            out.push(r.webPath);
        }
        if (!out.length) return res.json({ ok: false, errors: ['no files'] });
        /* images are committed together with the next content save; but commit
         * standalone too so uploads are never lost if the user abandons the form */
        gitops.commitPaths(['site/assets/img'], `admin(media): upload ${out.length} image(s)`,
            req.adminUser.name, req.adminUser.username + '@roofy-admin.local').catch(function () { });
        audit(req.adminUser.username, 'upload', out.join(', '));
        res.json({ ok: true, paths: out });
    } catch (e) {
        res.json({ ok: false, errors: ['上传失败 upload failed: ' + e.message] });
    }
});

router.get('/api/media/list', function (req, res) {
    res.json({ ok: true, images: uploads.listImages(req.query.folder || '') });
});

router.post('/api/media/delete', function (req, res) {
    const p = String((req.body || {}).path || '');
    try {
        const used = uploads.findUsages(p);
        if (used.length) {
            return res.json({ ok: false, errors: ['该图片正被使用,先在内容里移除引用 — image is referenced by: ' + used.join(', ')] });
        }
        uploads.deleteImage(p);
        gitops.commitPaths(['site/assets/img'], `admin(media): delete ${p}`,
            req.adminUser.name, req.adminUser.username + '@roofy-admin.local').catch(function () { });
        audit(req.adminUser.username, 'media-delete', p);
        res.json({ ok: true });
    } catch (e) {
        res.json({ ok: false, errors: [e.message] });
    }
});

router.post('/api/history/restore', async function (req, res) {
    const { sha, file } = req.body || {};
    if (!/^[0-9a-f]{6,40}$/.test(String(sha)) ||
        !/^site\/assets\/(data\/[a-z-]+\.json|js\/settings\.js)$/.test(String(file))) {
        return res.json({ ok: false, errors: ['bad request'] });
    }
    try {
        const r = await gitops.restoreFile(sha, file,
            `admin(history): restore ${file} to ${sha}`,
            req.adminUser.name, req.adminUser.username + '@roofy-admin.local');
        audit(req.adminUser.username, 'restore', `${file} -> ${sha}`);
        res.json({ ok: true, committed: r.committed });
    } catch (e) {
        res.json({ ok: false, errors: [e.message] });
    }
});

router.post('/api/settings/save', function (req, res) {
    const { data, baseSha } = req.body || {};
    const clean = {
        whatsapp: String((data || {}).whatsapp || '').replace(/[^\d]/g, ''),
        ga4Id: String((data || {}).ga4Id || '').trim(),
        pixelId: String((data || {}).pixelId || '').trim(),
        social: {
            instagram: String(((data || {}).social || {}).instagram || '').trim(),
            facebook: String(((data || {}).social || {}).facebook || '').trim(),
            linkedin: String(((data || {}).social || {}).linkedin || '').trim(),
            youtube: String(((data || {}).social || {}).youtube || '').trim()
        }
    };
    const errors = [];
    if (!clean.whatsapp || clean.whatsapp.length < 9) errors.push('WhatsApp 号码无效(需含国家码的纯数字) invalid WhatsApp number');
    if (clean.ga4Id && !/^G-[A-Z0-9]+$/.test(clean.ga4Id)) errors.push('GA4 ID 形如 G-XXXXXXXXXX');
    for (const k of Object.keys(clean.social)) {
        if (clean.social[k] && !/^https:\/\//.test(clean.social[k])) errors.push(`社媒链接需以 https:// 开头 social link must start with https:// (${k})`);
    }
    if (errors.length) return res.json({ ok: false, errors });
    let sha;
    try { sha = store.writeSettings(clean, baseSha); }
    catch (e) {
        if (e.code === 'CONFLICT') return res.json({ ok: false, errors: ['设置已被他人修改,请刷新 — settings changed; reload'] });
        throw e;
    }
    gitops.commitPaths([store.repoRel(store.SETTINGS_JS)], 'admin(settings): update site settings',
        req.adminUser.name, req.adminUser.username + '@roofy-admin.local')
        .then(function () {
            audit(req.adminUser.username, 'settings', '');
            res.json({ ok: true, newSha: sha });
        })
        .catch(function (e) { res.json({ ok: true, newSha: sha, warnings: ['git: ' + e.message] }); });
});

module.exports = router;
