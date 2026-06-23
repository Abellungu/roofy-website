/* Re-bake the prerendered static HTML after a content change so the crawlable
 * HTML (home 3-card strip + /news/index.html) reflects the new article.
 *
 * This closes the documented prerender gap for admin edits — BUT it needs jsdom
 * installed at the repo root (`npm install` once). If jsdom / prerender.js is
 * missing or errors (e.g. not yet installed on the VPS), we resolve with
 * ok:false instead of throwing: the JSON + client view still update, only the
 * baked HTML lags until the next manual `npm run prerender`. */
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const gitops = require('./gitops');

const REPO = gitops.REPO;

function available() {
    try {
        return fs.existsSync(path.join(REPO, 'prerender.js')) &&
            fs.existsSync(path.join(REPO, 'node_modules', 'jsdom'));
    } catch (e) { return false; }
}

/* Returns Promise<{ok, skipped?, error?}>. Never rejects. */
function run() {
    return new Promise(function (resolve) {
        if (!available()) {
            return resolve({ ok: false, skipped: true, error: 'prerender.js or jsdom not available at repo root' });
        }
        execFile('node', ['prerender.js'], { cwd: REPO, timeout: 120000, maxBuffer: 8 * 1024 * 1024 },
            function (err, stdout, stderr) {
                if (err) return resolve({ ok: false, error: (stderr || err.message || '').toString().slice(0, 300) });
                resolve({ ok: true, out: String(stdout).trim().split('\n').pop() });
            });
    });
}

module.exports = { run, available };
