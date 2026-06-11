/* Append-only audit log: one JSON line per admin action. */
const fs = require('fs');
const path = require('path');

const LOG = path.join(__dirname, '..', 'data', 'audit.log');

function audit(user, action, detail) {
    const line = JSON.stringify({
        at: new Date().toISOString(),
        user: user || 'anonymous',
        action,
        detail: detail || ''
    }) + '\n';
    try {
        fs.mkdirSync(path.dirname(LOG), { recursive: true });
        fs.appendFileSync(LOG, line);
    } catch (e) { console.error('[audit]', e.message); }
}

function tail(n) {
    try {
        const lines = fs.readFileSync(LOG, 'utf8').trim().split('\n');
        return lines.slice(-n).reverse().map(function (l) {
            try { return JSON.parse(l); } catch (e) { return null; }
        }).filter(Boolean);
    } catch (e) { return []; }
}

module.exports = { audit, tail };
