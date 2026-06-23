#!/usr/bin/env node
/* Scheduled news fetch — run by a systemd timer / cron on the VPS, e.g. weekly:
 *
 *   cd /opt/roofy-website/admin && node scripts/fetch-news.js
 *
 * Pulls candidates, AI-summarises, and queues drafts for human review at
 * /admin/news-drafts. It does NOT publish anything — a person still approves
 * each draft. Inert (no-op) until NEWS_API_KEY + ANTHROPIC_API_KEY are set.
 * Secrets come from the environment or admin/.env (see lib/loadenv.js). */
require('../lib/loadenv');
const pipeline = require('../lib/news-pipeline');

(async function () {
    const t0 = Date.now();
    try {
        const r = await pipeline.run({ limit: 8 });
        console.log('[fetch-news]', new Date().toISOString(),
            'added=' + r.added, 'skipped=' + r.skipped, 'errors=' + r.errors,
            'fetched=' + r.fetched, r.reason ? '(' + r.reason + ')' : '',
            '(' + (Date.now() - t0) + 'ms)');
        process.exit(0);
    } catch (e) {
        console.error('[fetch-news] failed:', e.message);
        process.exit(1);
    }
})();
