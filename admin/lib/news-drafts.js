/* News draft queue — AI-summarised candidates awaiting human review.
 * Append-only JSONL in admin/data/ (gitignored). One JSON object per line.
 *
 * A draft holds a full news.json article shape (so publishing is a straight
 * copy into articles[]) plus review metadata. Nothing here ever reaches the
 * public site until a human clicks "publish" in /admin/news-drafts, which is
 * where the legal + brand gate lives: we summarise + attribute + link out,
 * never republish source text or images verbatim. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA, 'news-drafts.jsonl');

/* Article fields carried into news.json on publish. */
const ARTICLE_FIELDS = [
    'id', 'category', 'publishedAt', 'coverImg',
    'titleZh', 'titleEn', 'excerptZh', 'excerptEn',
    'bodyZh', 'bodyEn', 'source', 'sourceUrl'
];

function all() {
    try {
        return fs.readFileSync(FILE, 'utf8').trim().split('\n')
            .map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } })
            .filter(Boolean);
    } catch (e) { return []; }
}

function pending() {
    return all().filter(function (d) { return d.status === 'pending'; });
}

function pendingCount() { return pending().length; }

function get(draftId) {
    return all().find(function (d) { return d.draftId === draftId; }) || null;
}

function rewrite(list) {
    fs.mkdirSync(DATA, { recursive: true });
    const out = list.map(function (d) { return JSON.stringify(d); }).join('\n') + (list.length ? '\n' : '');
    const tmp = FILE + '.tmp';
    fs.writeFileSync(tmp, out);
    fs.renameSync(tmp, FILE);
}

function append(draft) {
    const rec = Object.assign({
        draftId: crypto.randomBytes(8).toString('hex'),
        status: 'pending',
        fetchedAt: new Date().toISOString()
    }, draft);
    fs.mkdirSync(DATA, { recursive: true });
    fs.appendFileSync(FILE, JSON.stringify(rec) + '\n');
    return rec;
}

/* Patch the editable article fields of one draft (from the review form). */
function update(draftId, patch) {
    const list = all();
    const d = list.find(function (x) { return x.draftId === draftId; });
    if (!d) return null;
    ARTICLE_FIELDS.forEach(function (f) { if (f in patch) d[f] = patch[f]; });
    rewrite(list);
    return d;
}

function remove(draftId) {
    rewrite(all().filter(function (d) { return d.draftId !== draftId; }));
}

/* Dedup keys: a draft (or already-published article) is "seen" by its source
 * URL and by a normalised English title. The pipeline checks both so the same
 * story fetched twice, or a story already published, is never re-queued. */
function normTitle(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9一-鿿]+/g, ' ').trim();
}
function seenKeys(extraArticles) {
    const keys = new Set();
    const add = function (a) {
        if (!a) return;
        if (a.sourceUrl) keys.add('u:' + String(a.sourceUrl).split('?')[0].replace(/\/$/, ''));
        if (a.titleEn) keys.add('t:' + normTitle(a.titleEn));
        if (a.titleZh) keys.add('t:' + normTitle(a.titleZh));
    };
    all().forEach(add);                      // every draft (pending, published, rejected)
    (extraArticles || []).forEach(add);      // already-published news.json articles
    return keys;
}
function keysFor(article) {
    const k = [];
    if (article.sourceUrl) k.push('u:' + String(article.sourceUrl).split('?')[0].replace(/\/$/, ''));
    if (article.titleEn) k.push('t:' + normTitle(article.titleEn));
    return k;
}

module.exports = {
    FILE, ARTICLE_FIELDS,
    all, pending, pendingCount, get, append, update, remove,
    rewrite, seenKeys, keysFor
};
