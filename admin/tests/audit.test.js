const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'roofy-audit-test-'));
process.env.ROOFY_ADMIN_DATA_DIR = dataDir;
const auditLog = require('../lib/audit');

test.after(function () {
    fs.rmSync(dataDir, { recursive: true, force: true });
});

test('appends sanitized records and returns newest first', function () {
    auditLog.audit('alice\nadmin', 'login', '127.0.0.1\nsecond line');
    auditLog.audit('bob', 'save', 'properties/oasis');
    const rows = auditLog.tail(10);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].user, 'bob');
    assert.equal(rows[1].user, 'alice admin');
    assert.equal(rows[1].detail, '127.0.0.1 second line');
});

test('filters by exact user and action plus case-insensitive keyword', function () {
    auditLog.audit('alice', 'save', 'news/launch-event');
    auditLog.audit('alice', 'delete', 'news/old-event');
    auditLog.audit('bob', 'save', 'properties/river-view');

    const result = auditLog.query({ user: 'alice', action: 'save', q: 'LAUNCH' });
    assert.equal(result.total, 1);
    assert.equal(result.entries[0].detail, 'news/launch-event');
    assert.ok(result.users.includes('alice'));
    assert.ok(result.actions.includes('save'));
});

test('normalizes reversed date filters in Zambia local time', function () {
    const result = auditLog.query({ from: '2026-08-20', to: '2026-08-01' });
    assert.equal(result.filters.from, '2026-08-01');
    assert.equal(result.filters.to, '2026-08-20');
    assert.equal(auditLog.localDateKey('2026-08-11T22:30:00.000Z'), '2026-08-12');
    assert.equal(auditLog.formatLocal('2026-08-11T22:30:00.000Z'), '2026-08-12 00:30:00');
});

test('paginates and clamps out-of-range page numbers', function () {
    for (let i = 0; i < 7; i += 1) auditLog.audit('pager', 'save', String(i));
    const first = auditLog.query({ user: 'pager', page: '1' }, { perPage: 3 });
    const last = auditLog.query({ user: 'pager', page: '99' }, { perPage: 3 });
    assert.equal(first.entries.length, 3);
    assert.equal(first.pages, 3);
    assert.equal(last.page, 3);
    assert.equal(last.entries.length, 1);
});

test('ignores malformed JSON lines without breaking the log viewer', function () {
    fs.appendFileSync(auditLog.LOG, '{not-json}\n');
    const result = auditLog.query({});
    assert.ok(result.total >= 1);
    assert.equal(result.entries.some(function (row) { return row.action === undefined; }), false);
});
