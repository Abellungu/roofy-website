/* Append-only audit log: one JSON line per admin action. */
const fs = require('fs');
const path = require('path');

const DATA = process.env.ROOFY_ADMIN_DATA_DIR || path.join(__dirname, '..', 'data');
const LOG = path.join(DATA, 'audit.log');
const MAX_ENTRIES = 50000;
const MAX_USER = 80;
const MAX_ACTION = 80;
const MAX_DETAIL = 2000;

function clean(value, max) {
    return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

function audit(user, action, detail) {
    const line = JSON.stringify({
        at: new Date().toISOString(),
        user: clean(user || 'anonymous', MAX_USER) || 'anonymous',
        action: clean(action, MAX_ACTION) || 'unknown',
        detail: clean(detail, MAX_DETAIL)
    }) + '\n';
    try {
        fs.mkdirSync(path.dirname(LOG), { recursive: true });
        fs.appendFileSync(LOG, line, { mode: 0o600 });
        fs.chmodSync(LOG, 0o600);
    } catch (e) { console.error('[audit]', e.message); }
}

function readAll() {
    try {
        const lines = fs.readFileSync(LOG, 'utf8').trim().split('\n');
        return lines.slice(-MAX_ENTRIES).reverse().map(function (line) {
            try {
                const row = JSON.parse(line);
                if (!row || !row.at || !row.action) return null;
                return {
                    at: clean(row.at, 40),
                    user: clean(row.user || 'anonymous', MAX_USER) || 'anonymous',
                    action: clean(row.action, MAX_ACTION),
                    detail: clean(row.detail, MAX_DETAIL)
                };
            } catch (e) { return null; }
        }).filter(Boolean);
    } catch (e) { return []; }
}

function tail(n) {
    const count = Math.max(0, Math.min(Number(n) || 0, 500));
    return readAll().slice(0, count);
}

function dateParts(at) {
    const d = new Date(at);
    if (Number.isNaN(d.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lusaka', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(d).reduce(function (out, part) {
        if (part.type !== 'literal') out[part.type] = part.value;
        return out;
    }, {});
    return parts;
}

function localDateKey(at) {
    const p = dateParts(at);
    return p ? `${p.year}-${p.month}-${p.day}` : '';
}

function formatLocal(at) {
    const p = dateParts(at);
    return p ? `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}` : clean(at, 40);
}

function validDate(value) {
    const s = String(value || '');
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

function query(input, options) {
    const source = input || {};
    const opts = options || {};
    const filters = {
        user: clean(source.user, MAX_USER),
        action: clean(source.action, MAX_ACTION),
        q: clean(source.q, 120),
        from: validDate(source.from),
        to: validDate(source.to)
    };
    if (filters.from && filters.to && filters.from > filters.to) {
        const swap = filters.from;
        filters.from = filters.to;
        filters.to = swap;
    }

    const all = readAll();
    const users = Array.from(new Set(all.map(function (row) { return row.user; }))).sort();
    const actions = Array.from(new Set(all.map(function (row) { return row.action; }))).sort();
    const needle = filters.q.toLowerCase();
    const matched = all.filter(function (row) {
        if (filters.user && row.user !== filters.user) return false;
        if (filters.action && row.action !== filters.action) return false;
        const day = localDateKey(row.at);
        if (filters.from && day < filters.from) return false;
        if (filters.to && day > filters.to) return false;
        if (needle && !`${row.user}\n${row.action}\n${row.detail}`.toLowerCase().includes(needle)) return false;
        return true;
    });

    const perPage = Math.max(1, Math.min(Number(opts.perPage) || 50, 200));
    const total = matched.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const requestedPage = Math.max(1, Number.parseInt(source.page, 10) || 1);
    const page = Math.min(requestedPage, pages);
    const exportLimit = Math.max(1, Math.min(Number(opts.limit) || 10000, 50000));
    const entries = opts.all
        ? matched.slice(0, exportLimit)
        : matched.slice((page - 1) * perPage, page * perPage);
    const today = localDateKey(new Date().toISOString());
    const securityActions = new Set(['login-fail', 'login-locked', 'password-change-fail', 'username-change-fail']);

    return {
        entries, filters, users, actions, total, page, pages, perPage,
        truncated: !!opts.all && total > exportLimit,
        stats: {
            users: new Set(matched.map(function (row) { return row.user; })).size,
            today: matched.filter(function (row) { return localDateKey(row.at) === today; }).length,
            security: matched.filter(function (row) { return securityActions.has(row.action); }).length
        }
    };
}

module.exports = { audit, tail, query, formatLocal, localDateKey, LOG };
