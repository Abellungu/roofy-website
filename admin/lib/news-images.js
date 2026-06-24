/* Cover-image strategy for auto-fetched news.
 *
 * COPYRIGHT: we deliberately do NOT download or rehost the publisher's photo.
 * Instead every draft gets one of our own royalty-free stock images, chosen by
 * category and varied per-title so a batch doesn't all look identical. A human
 * can swap in a better image during review. (A future option is AI-generating a
 * category thumbnail; the stock pool is the safe default.) */
const fs = require('fs');
const path = require('path');
const store = require('./store');

const STOCK_DIR = path.join(store.SITE, 'assets', 'img', 'stock');

/* Curated per-category preference order (filenames must exist in stock/). The
 * pipeline falls back to the whole stock pool if a preferred file is missing. */
const BY_CATEGORY = {
    'international': ['u1474487548417.jpg', 'u1450101499163.jpg', 'u1526304640581.jpg', 'u1416331108676.jpg', 'u1486325212027.jpg', 'u1487958449943.jpg', 'u1495020689067.jpg', 'u1502672260266.jpg', 'u1505693416388.jpg'],
    'lusaka': ['u1500382017468.jpg', 'u1582407947304.jpg', 'u1542296332-2e.jpg', 'u1545324418-cc.jpg', 'u1512917774080.jpg', 'u1517502884422.jpg', 'u1600566753086.jpg', 'u1600566753190.jpg', 'u1600573472550.jpg'],
    'lusaka-real-estate': ['u1564013799919.jpg', 'u1605276374104.jpg', 'u1486406146926.jpg', 'u1497366216548.jpg', 'u1600573472556.jpg', 'u1600585154340.jpg', 'u1600585154526.jpg', 'u1600596542815.jpg', 'u1600607687939.jpg']
};

function pool() {
    try {
        return fs.readdirSync(STOCK_DIR).filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f); });
    } catch (e) { return []; }
}

function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return h;
}

/* Deterministic pick: same title always maps to the same image (stable across
 * re-fetches), but different titles spread across the category's options. */
function pickCover(category, seedTitle) {
    const all = pool();
    if (!all.length) return '/assets/img/stock/u1474487548417.jpg';
    let prefs = (BY_CATEGORY[category] || []).filter(function (f) { return all.indexOf(f) !== -1; });
    if (!prefs.length) prefs = all;
    const idx = hash(String(seedTitle || category)) % prefs.length;
    return '/assets/img/stock/' + prefs[idx];
}

module.exports = { pickCover, pool };
