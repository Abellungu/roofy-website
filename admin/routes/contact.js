/* PUBLIC contact-form endpoint. Mounted BEFORE requireAuth in server.js so
 * site visitors can submit without a session. Validated, honeypot-guarded and
 * per-IP rate limited. Submissions are stored to admin/data/leads.jsonl
 * (gitignored PII) and read by staff at /admin/leads. No third-party service,
 * so it stays reachable from the China side like the rest of the site. */
const express = require('express');
const leads = require('../lib/leads');
const { audit } = require('../lib/audit');

const router = express.Router();

const INTERESTS = new Set(['realestate', 'led', 'branding', 'other']);
const LIMITS = { name: 120, email: 200, phone: 40, message: 4000 };

function clean(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }
function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

router.post('/contact', function (req, res) {
    const b = req.body || {};

    /* honeypot: the hidden "website" field is invisible to humans; a bot that
     * fills it gets a fake success and nothing is stored. */
    if (clean(b.website, 200)) return res.json({ ok: true });

    if (leads.rateLimited(req.ip)) {
        return res.status(429).json({ ok: false, error: 'rate_limited' });
    }

    const lead = {
        name: clean(b.name, LIMITS.name),
        email: clean(b.email, LIMITS.email),
        phone: clean(b.phone, LIMITS.phone),
        interest: INTERESTS.has(String(b.interest)) ? String(b.interest) : 'other',
        message: clean(b.message, LIMITS.message),
        lang: b.lang === 'en' ? 'en' : 'zh',
        ua: clean(req.headers['user-agent'], 300),
        ip: req.ip
    };

    const bad = [];
    if (!lead.name) bad.push('name');
    if (!validEmail(lead.email)) bad.push('email');
    if (!lead.message) bad.push('message');
    if (bad.length) return res.status(400).json({ ok: false, error: 'invalid', fields: bad });

    try {
        leads.append(lead);
    } catch (e) {
        console.error('[contact] store failed:', e.message);
        return res.status(500).json({ ok: false, error: 'server' });
    }
    audit('visitor', 'lead', lead.interest + ' · ' + lead.email);
    res.json({ ok: true });
});

module.exports = router;
