/* Bilingual news summariser — turns a fetched source story into an ORIGINAL
 * zh+en summary with source attribution, via the Claude Messages API.
 *
 * COPYRIGHT: we summarise + attribute + link out; we never reproduce the
 * source article verbatim. The prompt instructs a faithful, original-wording
 * summary grounded in the headline + description, with no fabricated figures.
 *
 * INERT without a key: with no ANTHROPIC_API_KEY set, enabled() is false and the
 * pipeline skips summarisation entirely. We call the REST endpoint with the
 * built-in global fetch (Node ≥18) rather than adding the @anthropic-ai/sdk
 * dependency — the admin service is intentionally dependency-light and a hard
 * require of an uninstalled package would crash it on boot.
 *
 *   ANTHROPIC_API_KEY   = sk-ant-...        (shared with the planned AI chat)
 *   ANTHROPIC_BASE_URL  = https://api.anthropic.com  (override for a relay/proxy,
 *                         e.g. a new-api gateway exposing the Anthropic /v1/messages API)
 *   NEWS_SUMMARY_MODEL  = claude-opus-4-8   (default; set haiku/sonnet for cost)
 */
const KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.NEWS_SUMMARY_MODEL || 'claude-opus-4-8';
const BASE = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '');
const ENDPOINT = BASE + '/v1/messages';
/* Anthropic direct authenticates with x-api-key; new-api / relay gateways
 * authenticate the gateway token with Authorization: Bearer. Pick by host
 * (override with ANTHROPIC_AUTH_STYLE = bearer | x-api-key). */
const AUTH_STYLE = process.env.ANTHROPIC_AUTH_STYLE ||
    (BASE === 'https://api.anthropic.com' ? 'x-api-key' : 'bearer');

function authHeaders() {
    return AUTH_STYLE === 'bearer'
        ? { 'Authorization': 'Bearer ' + KEY }
        : { 'x-api-key': KEY };
}

function enabled() { return !!KEY; }

const SYSTEM = [
    'You are the bilingual (Simplified Chinese + English) news editor for ROOFY Investments Zambia,',
    'a comprehensive services group rooted in Zambia, connecting China and Zambia (real estate, LED advertising, branding).',
    'You are given ONE source news item (headline + short description + source name).',
    'Write an ORIGINAL, faithful summary in your OWN words — never copy the source text verbatim.',
    '',
    'Hard rules:',
    '- Do NOT invent SPECIFIC facts not in the source: no made-up figures, dates, quotes, names or statistics.',
    '  General, widely-known background context about Zambia / China-Zambia ties / the sector IS allowed and encouraged.',
    '- Stay factual and neutral. No marketing spin, no self-promotion, no fabricated testimonials.',
    '- ROOFY was founded in 2024. Never claim vanity stats (e.g. "320+ properties", "7+ years").',
    '- Both languages must say the same thing; zh is Simplified Chinese, en is English.',
    '',
    'Develop the story — do NOT just restate the headline. The source is thin (a headline + one or two',
    'sentences), so add value through framing, not invention:',
    '- Para 1: what happened, in your own words.',
    '- Middle paras: background and why it matters, using general regional/sector context (no invented specifics).',
    '- Final para: a short outlook on what this could mean for ROOFY\'s markets — Zambian real estate,',
    '  investment, or China-Zambia trade — clearly framed as interpretation/outlook, not as new fact.',
    '',
    'Lengths: titles <= 40 chars; excerpts 2-3 sentences; body 3-4 DEVELOPED paragraphs each (each a full',
    'paragraph, not a one-liner), parallel zh/en, with the final paragraph being the ROOFY-market outlook.',
    'Set relevant=false if the story has no plausible relevance to ROOFY\'s markets — the editor will skip it.',
    '',
    'Output EXACTLY in this marker format and nothing else — no JSON, no markdown, no commentary.',
    'Each field follows its @@marker@@ on the next line(s). In body fields, separate paragraphs with a blank line:',
    '@@titleZh@@',
    '中文标题',
    '@@titleEn@@',
    'English title',
    '@@excerptZh@@',
    '中文摘要',
    '@@excerptEn@@',
    'English excerpt',
    '@@bodyZh@@',
    '中文正文第一段\n\n第二段\n\n第三段',
    '@@bodyEn@@',
    'English body paragraph one\n\nparagraph two\n\nparagraph three',
    '@@relevant@@',
    'true'
].join('\n');

function buildUser(candidate) {
    const a = candidate.article || {};
    return [
        'Source item:',
        'Headline: ' + (a.title || ''),
        'Description: ' + (a.description || a.content || ''),
        'Source: ' + (a.source || 'Unknown'),
        'Suggested category: ' + (candidate.category || 'international'),
        '',
        'Write the bilingual summary JSON now.'
    ].join('\n');
}

/* Parse the @@marker@@ format. No escaping needed, so paragraphs may contain any
 * quotes / punctuation / newlines (the relay doesn't support tool-use, and free
 * JSON broke on long content). Returns {field: rawText}. */
function parseMarkers(text) {
    const re = /@@(titleZh|titleEn|excerptZh|excerptEn|bodyZh|bodyEn|relevant)@@/g;
    const hits = [];
    let m;
    while ((m = re.exec(text)) !== null) hits.push({ key: m[1], end: re.lastIndex, start: m.index });
    const out = {};
    for (let i = 0; i < hits.length; i++) {
        const to = i + 1 < hits.length ? hits[i + 1].start : text.length;
        out[hits[i].key] = text.slice(hits[i].end, to).trim();
    }
    return out;
}

/* Summarise one candidate → article fields (without id/coverImg/source, which
 * the pipeline fills in). Throws on API or shape error; caller decides per-item. */
async function summarize(candidate) {
    if (!enabled()) throw new Error('summariser disabled (no ANTHROPIC_API_KEY)');
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: Object.assign({
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        }, authHeaders()),
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 3500,
            system: SYSTEM,
            messages: [{ role: 'user', content: buildUser(candidate) }]
        })
    });
    if (!res.ok) {
        const body = await res.text().catch(function () { return ''; });
        throw new Error('claude ' + res.status + ': ' + body.slice(0, 200));
    }
    const data = await res.json();
    const text = (data.content || []).filter(function (b) { return b.type === 'text'; })
        .map(function (b) { return b.text; }).join('');
    const out = parseMarkers(text);
    if (!out.titleEn && !out.titleZh) throw new Error('unparseable model output (no markers)');
    /* Split body text into paragraphs on blank lines. */
    const splitP = function (s) { return String(s || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean); };
    return {
        titleZh: String(out.titleZh || '').trim(),
        titleEn: String(out.titleEn || '').trim(),
        excerptZh: String(out.excerptZh || '').trim(),
        excerptEn: String(out.excerptEn || '').trim(),
        bodyZh: splitP(out.bodyZh),
        bodyEn: splitP(out.bodyEn),
        relevant: !/^false$/i.test(String(out.relevant || '').trim())
    };
}

module.exports = { enabled, summarize, MODEL };
