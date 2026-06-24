/* News pipeline: fetch candidates → dedupe → AI-summarise → assign a cover →
 * append to the review queue (admin/data/news-drafts.jsonl). Nothing publishes
 * here; a human approves each draft in /admin/news-drafts.
 *
 * Safe to run with no keys: fetch returns [] (no NEWS_API_KEY) so the run is a
 * no-op; with a news key but no ANTHROPIC_API_KEY, summarisation throws per item
 * and those items are skipped (logged), so still nothing bad happens. */
const store = require('./store');
const fetcher = require('./news-fetch');
const summarizer = require('./news-summarize');
const images = require('./news-images');
const imageFetch = require('./news-image-fetch');
const drafts = require('./news-drafts');

function slugify(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'news';
}

function publishedDate(article) {
    const d = article && article.publishedAt ? new Date(article.publishedAt) : new Date();
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
}

function uniqueId(base, taken) {
    let id = base, n = 2;
    while (taken.has(id)) { id = base + '-' + n; n++; }
    taken.add(id);
    return id;
}

/* Run one pipeline pass. Returns {fetched, added, skipped, errors, reason}. */
async function run(opts) {
    opts = opts || {};
    const limit = opts.limit || 8;

    if (!fetcher.enabled()) {
        return { fetched: 0, added: 0, skipped: 0, errors: 0, reason: 'no NEWS_API_KEY — fetcher inert' };
    }

    let published = [];
    try { published = (store.readFile('news.json').json.articles) || []; } catch (e) { /* none */ }

    const seen = drafts.seenKeys(published);          // urls + titles already drafted/published
    const takenIds = new Set(published.map(function (a) { return a.id; }));
    drafts.all().forEach(function (d) { if (d.id) takenIds.add(d.id); });

    const candidates = await fetcher.fetchCandidates();
    let added = 0, skipped = 0, errors = 0;

    for (const cand of candidates) {
        if (added >= limit) break;
        const a = cand.article || {};
        /* dedupe vs everything already seen (published + queued + rejected) */
        const url = a.url ? 'u:' + String(a.url).split('?')[0].replace(/\/$/, '') : '';
        const titleKey = a.title ? 't:' + String(a.title).toLowerCase().replace(/[^a-z0-9一-鿿]+/g, ' ').trim() : '';
        if ((url && seen.has(url)) || (titleKey && seen.has(titleKey))) { skipped++; continue; }

        let summary;
        try {
            summary = await summarizer.summarize(cand);
        } catch (e) {
            console.error('[news-pipeline] summarise failed:', e.message);
            errors++;
            continue;
        }
        if (!summary.relevant || !summary.titleEn) { skipped++; continue; }

        const id = uniqueId(slugify(summary.titleEn), takenIds);
        /* Real article photo, self-hosted; stock fallback when blocked/absent. */
        let cover = await imageFetch.downloadCover(a.image, id);
        const usedSourceImg = !!cover;
        if (!cover) cover = images.pickCover(cand.category, summary.titleEn);
        const article = {
            id: id,
            category: cand.category || 'international',
            publishedAt: publishedDate(a),
            coverImg: cover,
            titleZh: summary.titleZh,
            titleEn: summary.titleEn,
            excerptZh: summary.excerptZh,
            excerptEn: summary.excerptEn,
            bodyZh: summary.bodyZh,
            bodyEn: summary.bodyEn,
            source: a.source || '',
            sourceUrl: a.url || ''
        };
        drafts.append(Object.assign({ originalUrl: a.url || '', sourceImageUrl: a.image || '',
            sourceImageUsed: usedSourceImg, model: summarizer.MODEL }, article));
        if (url) seen.add(url);
        if (titleKey) seen.add(titleKey);
        added++;
    }

    return { fetched: candidates.length, added: added, skipped: skipped, errors: errors,
        reason: added ? null : (candidates.length ? 'all candidates duplicate/irrelevant' : 'no candidates returned') };
}

module.exports = { run };
