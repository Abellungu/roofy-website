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
 *   NEWS_SUMMARY_MODEL  = claude-opus-4-8   (default; set haiku/sonnet for cost)
 */
const KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.NEWS_SUMMARY_MODEL || 'claude-opus-4-8';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

function enabled() { return !!KEY; }

const SYSTEM = [
    'You are the bilingual (Simplified Chinese + English) news editor for ROOFY Investments Zambia,',
    'a comprehensive services group rooted in Zambia, connecting China and Zambia (real estate, LED advertising, branding).',
    'You are given ONE source news item (headline + short description + source name).',
    'Write an ORIGINAL, faithful summary in your OWN words — never copy the source text verbatim.',
    '',
    'Hard rules:',
    '- Do NOT invent facts, figures, dates, quotes or place names not present in the input. If a detail is absent, omit it.',
    '- Stay factual and neutral. No marketing spin, no self-promotion, no fabricated testimonials.',
    '- ROOFY was founded in 2024. Never claim vanity stats (e.g. "320+ properties", "7+ years").',
    '- Relevance: prefer angles relevant to Zambia / Lusaka / China-Zambia ties / real estate / investment.',
    '- Both languages must say the same thing; zh is Simplified Chinese, en is English.',
    '',
    'Return ONLY a JSON object (no markdown, no prose) with exactly these keys:',
    '{ "titleZh": str, "titleEn": str, "excerptZh": str, "excerptEn": str,',
    '  "bodyZh": [str, ...], "bodyEn": [str, ...], "relevant": bool }',
    'titles: <= 40 chars each. excerpts: 1-2 sentences. body: 2-3 short paragraphs each, parallel zh/en.',
    'Set "relevant" false if the story has no plausible relevance to ROOFY\'s markets — the editor will skip it.'
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

function extractJson(text) {
    const s = String(text || '');
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('no JSON in model output');
    return JSON.parse(s.slice(start, end + 1));
}

/* Summarise one candidate → article fields (without id/coverImg/source, which
 * the pipeline fills in). Throws on API or parse error; caller decides per-item. */
async function summarize(candidate) {
    if (!enabled()) throw new Error('summariser disabled (no ANTHROPIC_API_KEY)');
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'x-api-key': KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 2000,
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
    const out = extractJson(text);
    /* Normalise body fields to arrays of non-empty strings. */
    const arr = function (v) { return (Array.isArray(v) ? v : [v]).map(String).map(function (s) { return s.trim(); }).filter(Boolean); };
    return {
        titleZh: String(out.titleZh || '').trim(),
        titleEn: String(out.titleEn || '').trim(),
        excerptZh: String(out.excerptZh || '').trim(),
        excerptEn: String(out.excerptEn || '').trim(),
        bodyZh: arr(out.bodyZh),
        bodyEn: arr(out.bodyEn),
        relevant: out.relevant !== false
    };
}

module.exports = { enabled, summarize, MODEL };
