/* News source client. Pulls candidate stories from a licensed news API — we do
 * NOT scrape publisher HTML (fragile, and legally murkier). Provider + key come
 * from the environment, so with no key configured this module is INERT: every
 * call resolves to [] and the pipeline simply adds nothing.
 *
 *   NEWS_API_PROVIDER = gnews | newsapi    (default: gnews)
 *   NEWS_API_KEY      = <your key>
 *
 * Both providers return article objects we normalise to:
 *   { title, description, content, url, source, publishedAt, image }
 * Only title/description/url/source/publishedAt are used downstream (the image
 * is ignored on purpose — see news-images.js for the copyright reasoning). */
const PROVIDER = (process.env.NEWS_API_PROVIDER || 'gnews').toLowerCase();
const KEY = process.env.NEWS_API_KEY || '';

/* Search themes → query strings. Each becomes one API call; results are tagged
 * with the matching news.json category so drafts land in the right bucket. */
const TOPICS = [
    { category: 'international', q: '(Zambia OR China) AND (investment OR "bilateral" OR infrastructure OR trade OR copper)' },
    { category: 'lusaka', q: 'Lusaka AND (development OR road OR airport OR project OR council OR expo)' },
    { category: 'lusaka-real-estate', q: '(Lusaka OR Zambia) AND ("real estate" OR property OR housing OR rent OR land OR leasehold)' }
];

function enabled() { return !!KEY; }

async function callGnews(q) {
    const url = 'https://gnews.io/api/v4/search?lang=en&max=10&sortby=publishedAt' +
        '&q=' + encodeURIComponent(q) + '&apikey=' + encodeURIComponent(KEY);
    const r = await fetch(url);
    if (!r.ok) throw new Error('gnews ' + r.status);
    const j = await r.json();
    return (j.articles || []).map(function (a) {
        return {
            title: a.title, description: a.description, content: a.content,
            url: a.url, source: (a.source && a.source.name) || '', publishedAt: a.publishedAt, image: a.image
        };
    });
}

async function callNewsapi(q) {
    const url = 'https://newsapi.org/v2/everything?language=en&pageSize=10&sortBy=publishedAt' +
        '&q=' + encodeURIComponent(q) + '&apiKey=' + encodeURIComponent(KEY);
    const r = await fetch(url);
    if (!r.ok) throw new Error('newsapi ' + r.status);
    const j = await r.json();
    return (j.articles || []).map(function (a) {
        return {
            title: a.title, description: a.description, content: a.content,
            url: a.url, source: (a.source && a.source.name) || '', publishedAt: a.publishedAt, image: a.urlToImage
        };
    });
}

async function fetchTopic(q) {
    if (PROVIDER === 'newsapi') return callNewsapi(q);
    return callGnews(q);
}

/* Returns [{ category, article }] across all topics. Per-topic failures are
 * swallowed so one bad query doesn't sink the whole run. */
async function fetchCandidates() {
    if (!enabled()) return [];
    const out = [];
    for (const t of TOPICS) {
        try {
            const arts = await fetchTopic(t.q);
            arts.forEach(function (a) { if (a && a.title && a.url) out.push({ category: t.category, article: a }); });
        } catch (e) {
            console.error('[news-fetch]', t.category, e.message);
        }
    }
    return out;
}

module.exports = { enabled, fetchCandidates, TOPICS, PROVIDER };
