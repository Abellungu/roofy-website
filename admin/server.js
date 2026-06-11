/* ROOFY Admin — self-hosted bilingual CMS for the static site.
 * No database: site/assets/data/*.json is the store, git is the history.
 *
 *   PORT=3127 ROOFY_REPO=/opt/roofy-website node server.js
 *
 * In production nginx proxies https://<domain>/admin/ -> 127.0.0.1:3127/admin/. */
const path = require('path');
const express = require('express');
const auth = require('./lib/auth');
const store = require('./lib/store');
const { audit } = require('./lib/audit');
const H = require('./lib/html');

const PORT = Number(process.env.PORT || 3127);
const BASE = '/admin';
const PROD = process.env.NODE_ENV === 'production';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

/* security headers */
app.use(function (req, res, next) {
    res.set({
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'"
    });
    next();
});

/* Same-origin check for mutating requests — a belt on top of the
 * SameSite=Strict session cookie (the primary CSRF guard: cross-site
 * requests never carry the cookie, so authenticated APIs 401 anyway).
 * `Origin: null` is treated as absent: privacy extensions and sandboxed
 * contexts send it for legitimate same-site form posts (seen in the wild
 * with crypto-wallet extensions). */
const ALLOWED_HOSTS = new Set(['roofyinvestments.com', 'www.roofyinvestments.com', '127.0.0.1:' + PORT, 'localhost:' + PORT]);
app.use(function (req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD') return next();
    const origin = req.headers.origin;
    if (!origin || origin === 'null') return next();
    let originHost = null;
    try { originHost = new URL(origin).host; } catch (e) { /* falls through to block */ }
    const ok = originHost && (ALLOWED_HOSTS.has(originHost) ||
        originHost === req.headers['x-forwarded-host'] || originHost === req.headers.host);
    if (!ok) {
        console.error('[origin-block]', req.method, req.path,
            'origin=' + origin, 'host=' + req.headers.host, 'xfh=' + (req.headers['x-forwarded-host'] || ''));
        return res.status(403).json({ ok: false, error: 'cross-origin blocked' });
    }
    next();
});

const router = express.Router();

/* static: admin assets + read-only view of the site's assets (thumbnails) */
router.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
router.use('/site-assets/assets', express.static(path.join(store.SITE, 'assets'), { maxAge: '5m' }));

/* ── login (unauthenticated) ── */
router.get('/login', function (req, res) {
    res.send(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,nofollow">
<title>登录 · ROOFY Admin</title><link rel="stylesheet" href="${BASE}/public/admin.css?v=${H.ASSET_V}"></head>
<body class="login-body"><form class="login-card" method="post" action="${BASE}/login">
<div class="brand center"><span class="b1">Roofy</span><span class="b2">内容管理 Content Admin</span></div>
${req.query.e === 'locked' ? '<div class="errbox">尝试次数过多,请 15 分钟后再试 — too many attempts, retry in 15 minutes</div>' : ''}
${req.query.e === 'bad' ? '<div class="errbox">用户名或密码错误 — wrong username or password</div>' : ''}
<label class="flabel">用户名 Username</label>
<input class="inp" name="username" autocomplete="username" required>
<label class="flabel">密码 Password</label>
<input class="inp" type="password" name="password" autocomplete="current-password" required>
<button class="btn-primary wide" type="submit">登录 Sign in</button>
<div class="login-foot">仅限授权人员 · Authorized staff only</div>
</form></body></html>`);
});

router.post('/login', function (req, res) {
    const ip = req.ip;
    const { username, password } = req.body || {};
    if (auth.isLocked(ip, username)) return res.redirect(BASE + '/login?e=locked');
    const r = auth.attemptLogin(ip, String(username || ''), String(password || ''));
    if (r.locked) return res.redirect(BASE + '/login?e=locked');
    if (!r.ok) { audit(username, 'login-fail', ip); return res.redirect(BASE + '/login?e=bad'); }
    audit(username, 'login', ip);
    res.cookie(auth.COOKIE, r.token, {
        httpOnly: true, sameSite: 'strict', secure: PROD, path: BASE, maxAge: 7 * 24 * 3600 * 1000
    });
    res.redirect(BASE + '/');
});

router.post('/logout', auth.requireAuth, function (req, res) {
    const token = auth.parseCookies(req)[auth.COOKIE];
    if (token) require('./lib/auth').destroySession(token);
    res.clearCookie(auth.COOKIE, { path: BASE });
    res.redirect(BASE + '/login');
});

/* ── authenticated area ── */
router.use(auth.requireAuth);
router.use(require('./routes/content'));
router.use(require('./routes/api'));
router.use(require('./routes/pages'));

app.use(BASE, router);
app.get('/', function (req, res) { res.redirect(BASE + '/'); });

/* error guard: never leak stack traces */
app.use(function (err, req, res, next) {
    console.error('[admin]', err);
    if (res.headersSent) return next(err);
    if (req.path.includes('/api/')) return res.status(500).json({ ok: false, error: 'server error' });
    res.status(500).send('Server error — 服务器错误,请稍后再试');
});

app.listen(PORT, '127.0.0.1', function () {
    console.log(`ROOFY Admin on http://127.0.0.1:${PORT}${BASE}  repo=${require('./lib/gitops').REPO}`);
});
