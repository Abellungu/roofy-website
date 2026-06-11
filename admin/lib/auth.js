/* Authentication: scrypt-hashed users in data/users.json, random-token sessions
 * in data/sessions.json, per-IP+user login rate limiting. No external deps. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'data');
const USERS = path.join(DATA, 'users.json');
const SESSIONS = path.join(DATA, 'sessions.json');

const SESSION_TTL = 7 * 24 * 3600 * 1000;       // 7 days, sliding
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;                 // 15 min lockout

const fails = new Map();                        // key ip|user -> {count, until}

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function writeJson(file, obj) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, file);
}

/* ── passwords ── */
function hashPassword(password, salt) {
    salt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 }).toString('hex');
    return { salt, hash };
}
function verifyPassword(password, rec) {
    const probe = crypto.scryptSync(password, rec.salt, 32, { N: 16384, r: 8, p: 1 });
    const stored = Buffer.from(rec.hash, 'hex');
    return probe.length === stored.length && crypto.timingSafeEqual(probe, stored);
}

/* ── users ── */
function getUsers() { return readJson(USERS, {}); }
function upsertUser(username, password, displayName) {
    const users = getUsers();
    const { salt, hash } = hashPassword(password);
    users[username] = {
        salt, hash,
        name: displayName || username,
        createdAt: users[username] ? users[username].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    writeJson(USERS, users);
}

/* ── sessions ── */
function loadSessions() { return readJson(SESSIONS, {}); }
function saveSessions(s) { writeJson(SESSIONS, s); }

function createSession(username) {
    const sessions = loadSessions();
    const now = Date.now();
    for (const k of Object.keys(sessions)) if (sessions[k].exp < now) delete sessions[k];
    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = { user: username, exp: now + SESSION_TTL };
    saveSessions(sessions);
    return token;
}
function destroySession(token) {
    const sessions = loadSessions();
    delete sessions[token];
    saveSessions(sessions);
}
function touchSession(token) {
    const sessions = loadSessions();
    const s = sessions[token];
    if (!s || s.exp < Date.now()) return null;
    // slide expiry at most once per hour to limit disk writes
    if (s.exp - Date.now() < SESSION_TTL - 3600 * 1000) {
        s.exp = Date.now() + SESSION_TTL;
        saveSessions(sessions);
    }
    return s;
}

/* ── rate limiting ── */
function failKey(ip, user) { return ip + '|' + (user || ''); }
function isLocked(ip, user) {
    const rec = fails.get(failKey(ip, user));
    return !!(rec && rec.until && rec.until > Date.now());
}
function recordFail(ip, user) {
    const k = failKey(ip, user);
    const rec = fails.get(k) || { count: 0, until: 0 };
    rec.count += 1;
    if (rec.count >= MAX_FAILS) { rec.until = Date.now() + LOCK_MS; rec.count = 0; }
    fails.set(k, rec);
}
function clearFails(ip, user) { fails.delete(failKey(ip, user)); }

/* ── login flow ── */
function attemptLogin(ip, username, password) {
    if (isLocked(ip, username)) return { ok: false, locked: true };
    const users = getUsers();
    const rec = users[username];
    if (!rec || !verifyPassword(password, rec)) {
        recordFail(ip, username);
        return { ok: false };
    }
    clearFails(ip, username);
    return { ok: true, token: createSession(username), name: rec.name };
}

function changePassword(username, oldPw, newPw) {
    const users = getUsers();
    const rec = users[username];
    if (!rec || !verifyPassword(oldPw, rec)) return false;
    if (!newPw || newPw.length < 10) return false;
    upsertUser(username, newPw, rec.name);
    return true;
}

/* ── express middleware ── */
const COOKIE = 'roofy_admin';

function parseCookies(req) {
    const out = {};
    (req.headers.cookie || '').split(';').forEach(function (kv) {
        const i = kv.indexOf('=');
        if (i > 0) out[kv.slice(0, i).trim()] = decodeURIComponent(kv.slice(i + 1).trim());
    });
    return out;
}

function requireAuth(req, res, next) {
    const token = parseCookies(req)[COOKIE];
    const sess = token && touchSession(token);
    if (!sess) {
        if (req.path.startsWith('/api/')) return res.status(401).json({ ok: false, error: 'unauthorized' });
        return res.redirect((req.baseUrl || '') + '/login');
    }
    const users = getUsers();
    req.adminUser = { username: sess.user, name: (users[sess.user] || {}).name || sess.user, token };
    next();
}

module.exports = {
    COOKIE, hashPassword, upsertUser, getUsers, attemptLogin, destroySession,
    changePassword, requireAuth, parseCookies, isLocked
};
