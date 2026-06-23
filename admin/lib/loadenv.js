/* Minimal .env loader (no dependency). Reads admin/.env (gitignored) and sets
 * any KEY=VALUE it finds into process.env WITHOUT overriding values already in
 * the environment — so systemd/shell env always wins on the VPS, and .env is
 * just a local-dev convenience. Used for secrets: NEWS_API_KEY, ANTHROPIC_API_KEY.
 * Lines starting with # and blank lines are ignored; surrounding quotes stripped. */
const fs = require('fs');
const path = require('path');

(function load() {
    const file = path.join(__dirname, '..', '.env');
    let raw;
    try { raw = fs.readFileSync(file, 'utf8'); } catch (e) { return; }
    raw.split(/\r?\n/).forEach(function (line) {
        const s = line.trim();
        if (!s || s[0] === '#') return;
        const eq = s.indexOf('=');
        if (eq < 0) return;
        const key = s.slice(0, eq).trim();
        let val = s.slice(eq + 1).trim();
        if ((val[0] === '"' && val.slice(-1) === '"') || (val[0] === "'" && val.slice(-1) === "'")) {
            val = val.slice(1, -1);
        }
        if (key && !(key in process.env)) process.env[key] = val;
    });
})();
