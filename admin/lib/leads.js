/* Contact-form leads — append-only JSONL in admin/data/ (gitignored: this is
 * visitor PII, it must never be committed or served). One JSON object per line.
 * Plus a small in-memory per-IP rate limiter so the public endpoint can't be
 * flooded without any external dependency. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'data');
const LEADS = path.join(DATA, 'leads.jsonl');

/* ── per-IP rate limiting (in-memory; resets on restart) ── */
const WINDOW_MS = 60 * 60 * 1000;   // 1 hour
const MAX_PER_WINDOW = 6;           // submissions per IP per hour
const hits = new Map();             // ip -> number[] (recent timestamps)

function rateLimited(ip) {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter(function (t) { return now - t < WINDOW_MS; });
    if (recent.length >= MAX_PER_WINDOW) { hits.set(ip, recent); return true; }
    recent.push(now);
    hits.set(ip, recent);
    return false;
}

/* ── store ── */
function append(lead) {
    const rec = Object.assign({
        id: crypto.randomBytes(8).toString('hex'),
        at: new Date().toISOString(),
        read: false
    }, lead);
    fs.mkdirSync(DATA, { recursive: true });
    fs.appendFileSync(LEADS, JSON.stringify(rec) + '\n');
    return rec;
}

function all() {
    try {
        return fs.readFileSync(LEADS, 'utf8').trim().split('\n')
            .map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } })
            .filter(Boolean);
    } catch (e) { return []; }
}

function unreadCount() {
    return all().filter(function (l) { return !l.read; }).length;
}

/* small volumes — fine to rewrite the whole file atomically (tmp + rename). */
function rewrite(list) {
    fs.mkdirSync(DATA, { recursive: true });
    const out = list.map(function (l) { return JSON.stringify(l); }).join('\n') + (list.length ? '\n' : '');
    const tmp = LEADS + '.tmp';
    fs.writeFileSync(tmp, out);
    fs.renameSync(tmp, LEADS);
}

function markAllRead() {
    const list = all();
    let changed = false;
    list.forEach(function (l) { if (!l.read) { l.read = true; changed = true; } });
    if (changed) rewrite(list);
}

function remove(id) {
    rewrite(all().filter(function (l) { return l.id !== id; }));
}

module.exports = { append, all, unreadCount, markAllRead, remove, rateLimited, LEADS };
