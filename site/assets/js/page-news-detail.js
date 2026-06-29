/* News article detail page. Reads ?id=<slug> at runtime, looks up the
 * article in /assets/data/news.json, renders body + metadata + 3 related
 * articles from the same category. Missing/unknown ?id= → renders a
 * not-found block (HTTP-200) with a link back to the listing.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { news: [] };
window.ROOFY_PAGE = { id: 'news-detail', whatsapp: 'news' };

function currentArticleId() {
    try { return new URLSearchParams(location.search).get('id'); }
    catch (_) { return null; }
}

function currentArticle() {
    const id = currentArticleId();
    if (!id) return null;
    return (window.ROOFY_DATA.news || []).find(function (a) { return a.id === id; }) || null;
}

function formatDate(iso, lang) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    if (lang === 'zh') {
        return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
    }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function notFoundBlock() {
    const T = ROOFY.tr();
    return '<section class="bg-slate-50 min-h-[60vh] flex items-center">' +
        '<div class="max-w-[640px] mx-auto px-6 lg:px-10 py-24 text-center">' +
        '<i data-lucide="file-question" class="w-12 h-12 mx-auto mb-6 text-slate-400"></i>' +
        '<h1 class="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">' +
        (ROOFY.state.lang === 'zh' ? '文章未找到' : 'Article not found') + '</h1>' +
        '<p class="text-slate-600 mb-8">' + T.news.notFound + '</p>' +
        '<a href="/news/index.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-sm transition-colors">' +
        T.news.notFoundCta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

function detailHero(a) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const title = lang === 'zh' ? a.titleZh : a.titleEn;
    const catLabel = T.news.categories[a.category] || a.category;
    return '<section class="relative bg-slate-900 pt-28 pb-12 lg:pt-36 lg:pb-16 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute inset-0">' +
        '<img src="' + a.coverImg + '" data-placeholder="' + (a.placeholder ? 'true' : 'false') + '" alt="' + title + '" class="w-full h-full object-cover opacity-30" />' +
        '<div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/85 to-slate-900/70"></div>' +
        '</div>' +
        '<div class="relative max-w-[800px] mx-auto px-6 lg:px-10">' +
        '<a href="/news/index.html" class="reveal-mask inline-flex"><span class="reveal-line inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors mb-6">' +
        '<i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>' + T.news.back + '</span></a>' +
        '<div class="flex flex-wrap items-center gap-2 mb-5">' +
        '<span class="text-xs font-semibold uppercase tracking-wider bg-amber-500 text-slate-900 px-2.5 py-1 rounded-sm">' + catLabel + '</span>' +
        (a.placeholder ? '<span class="text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-sm">' + T.news.sample + '</span>' : '') +
        '</div>' +
        '<h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-5"><span class="block reveal-mask"><span class="reveal-line">' + title + '</span></span></h1>' +
        '<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">' +
        '<span class="inline-flex items-center gap-1.5"><i data-lucide="calendar" class="w-3.5 h-3.5"></i>' + formatDate(a.publishedAt, lang) + '</span>' +
        (a.source ? '<span class="inline-flex items-center gap-1.5"><i data-lucide="newspaper" class="w-3.5 h-3.5"></i>' + T.news.source + ' · ' + a.source + '</span>' : '') +
        '</div>' +
        '</div></section>';
}

function detailBody(a) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const body = (lang === 'zh' ? a.bodyZh : a.bodyEn) || [];
    const paragraphs = body.map(function (p) {
        return '<p data-reveal-up>' + p + '</p>';
    }).join('');
    let sourceLink = '';
    if (a.sourceUrl) {
        sourceLink = '<p class="text-sm text-slate-500 mt-10"><a href="' + a.sourceUrl + '" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium">' +
            T.news.sourceLink + '<i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a></p>';
    }
    return '<section class="py-12 lg:py-20 bg-white">' +
        '<div class="max-w-[720px] mx-auto px-6 lg:px-10 prose-article">' +
        paragraphs + sourceLink +
        '</div></section>';
}

function relatedSection(a) {
    const T = ROOFY.tr();
    const all = window.ROOFY_DATA.news || [];
    const list = all.filter(function (b) { return b.category === a.category && b.id !== a.id; })
        .sort(function (x, y) { return new Date(y.publishedAt || 0) - new Date(x.publishedAt || 0); })
        .slice(0, 3);
    if (!list.length) return '';
    const lang = ROOFY.state.lang;
    const cards = list.map(function (r) {
        const rTitle = lang === 'zh' ? r.titleZh : r.titleEn;
        const rExcerpt = lang === 'zh' ? r.excerptZh : r.excerptEn;
        return '<a href="/news/article.html?id=' + encodeURIComponent(r.id) + '" ' +
            'class="group block bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">' +
            '<div class="aspect-[16/10] overflow-hidden bg-slate-100">' +
            '<img src="' + r.coverImg + '" data-placeholder="' + (r.placeholder ? 'true' : 'false') + '" alt="' + rTitle + '" loading="lazy" class="w-full h-full object-cover" />' +
            '</div>' +
            '<div class="p-5">' +
            '<div class="text-xs text-slate-500 mb-2">' + formatDate(r.publishedAt, lang) + '</div>' +
            '<h3 class="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">' + rTitle + '</h3>' +
            '<p class="text-xs text-slate-600 line-clamp-2">' + (rExcerpt || '') + '</p>' +
            '</div></a>';
    }).join('');

    return '<section class="py-16 lg:py-20 bg-slate-50 border-t border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.news.related + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-semibold text-slate-900 mb-8" data-reveal-up>' +
        (T.news.categories[a.category] || a.category) + '</h2>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">' + cards + '</div>' +
        '</div></section>';
}

window.renderPage = function () {
    if (!(window.ROOFY_DATA.news && window.ROOFY_DATA.news.length)) {
        return PARTIALS.navHtml() +
            '<main><div class="py-32 text-center text-slate-500">Loading…</div></main>' +
            PARTIALS.footerHtml();
    }
    const a = currentArticle();
    if (!a) {
        return PARTIALS.navHtml() +
            '<main>' + notFoundBlock() + '</main>' +
            PARTIALS.footerHtml();
    }
    /* Inject NewsArticle JSON-LD into <head> for SEO once article is resolved. */
    try {
        const head = document.head;
        let existing = head.querySelector('script[data-roofy-jsonld="article"]');
        if (existing) existing.remove();
        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.dataset.roofyJsonld = 'article';
        ld.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: a.titleEn || a.titleZh,
            datePublished: a.publishedAt,
            image: a.coverImg,
            publisher: { '@type': 'Organization', name: 'Roofy Investments Zambia' },
            articleSection: a.category
        });
        head.appendChild(ld);
        document.title = (a.titleEn || a.titleZh) + ' — Roofy News';
    } catch (_) { }

    return PARTIALS.navHtml() +
        '<main>' +
        detailHero(a) +
        detailBody(a) +
        relatedSection(a) +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadNewsData() {
    return fetch('/assets/data/news.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { window.ROOFY_DATA.news = (d && d.articles) || []; })
        .catch(function () { });
}

window.addEventListener('DOMContentLoaded', function () {
    loadNewsData().then(function () { ROOFY.boot({ page: 'news' }); });
});
