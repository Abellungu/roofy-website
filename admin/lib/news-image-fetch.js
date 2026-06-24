/* Download a source article's lead image and self-host it (the editor chose
 * download+rehost over hotlinking for reliability). Mirrors lib/uploads.js:
 * sharp → ≤1600px JPG under site/assets/img/news/. Returns the web path, or
 * null on any failure (no URL, 403/hotlink-block, non-image, too small, decode
 * error) so the pipeline falls back to a stock cover.
 *
 * Legal posture (editor-approved): used only as an attributed thumbnail with a
 * link back to the source; a human can swap it during review. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const store = require('./store');

const NEWS_DIR = path.join(store.SITE, 'assets', 'img', 'news');
const UA = 'Mozilla/5.0 (compatible; RoofyNewsBot/1.0; +https://www.roofyinvestments.com)';

async function downloadCover(url, slug) {
    if (!url || !/^https?:\/\//i.test(url)) return null;
    let buf;
    try {
        const res = await fetch(url, {
            redirect: 'follow',
            headers: { 'User-Agent': UA, 'Accept': 'image/*' },
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) return null;
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (!/^image\//.test(ct)) return null;
        buf = Buffer.from(await res.arrayBuffer());
    } catch (e) { return null; }
    if (!buf || buf.length < 3000) return null;   // skip tracking pixels / tiny images

    /* Reject low-detail images (flags, logos, solid-colour OG cards) — they read
     * as "broken / half-loaded" on the page. Photos score ~6-7.5 entropy; flags
     * and logos score under ~3. Below the threshold we fall back to stock. */
    try {
        const st = await sharp(buf, { failOn: 'none' }).stats();
        if (typeof st.entropy === 'number' && st.entropy < 4.5) return null;
    } catch (e) { /* stats failed — don't block on it */ }

    try {
        fs.mkdirSync(NEWS_DIR, { recursive: true });
        const out = path.join(NEWS_DIR, slug + '.jpg');
        await sharp(buf, { failOn: 'none' })
            .rotate()
            .resize({ width: 1600, withoutEnlargement: true })
            .jpeg({ quality: 78, mozjpeg: true })
            .toFile(out);
        return '/assets/img/news/' + slug + '.jpg';
    } catch (e) { return null; }
}

/* Remove a self-hosted news cover (used when a draft is rejected). No-op for
 * stock covers or anything outside the news folder. */
function removeCover(coverImg) {
    if (!coverImg || coverImg.indexOf('/assets/img/news/') !== 0) return;
    if (!/^\/assets\/img\/news\/[A-Za-z0-9._-]+$/.test(coverImg)) return;
    try { fs.unlinkSync(path.join(store.SITE, coverImg.replace(/^\//, ''))); } catch (e) { /* gone already */ }
}

module.exports = { downloadCover, removeCover, NEWS_DIR };
