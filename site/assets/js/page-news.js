/* News listing — 3 categories (international / lusaka / lusaka-real-estate)
 * tabbed in a single page. Reads /assets/data/news.json (seeded placeholders
 * until editors fill in via Sanity Studio).
 *
 * Filter state lives in ROOFY.state.newsCategory (re-used — same shape:
 * 'all' | <category>). setFilter() already triggers re-render.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { news: [] };
window.ROOFY_PAGE = { id: 'news', whatsapp: 'news' };

const NEWS_CATS = ['all', 'international', 'lusaka', 'lusaka-real-estate'];

function newsHero() {
    const T = ROOFY.tr();
    return '<section id="top" class="relative bg-slate-50 pt-32 lg:pt-44 pb-20 lg:pb-28 overflow-hidden" data-hero-reveal>' +
        '<div aria-hidden="true" class="pointer-events-none absolute -right-3 bottom-0 leading-[0.7] font-black tracking-tighter text-slate-900/[0.04] text-[150px] sm:text-[220px] lg:text-[300px] select-none">News</div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl">' +
        '<h1 class="font-display font-medium text-slate-900 leading-[0.95] text-6xl lg:text-8xl"><span class="block reveal-mask"><span class="reveal-line">' + T.news.title + '</span></span></h1>' +
        '<div class="reveal-mask mt-7"><p class="reveal-line text-xs sm:text-sm tracking-[0.24em] uppercase text-slate-500">' + T.news.desc + '</p></div>' +
        '</div>' +
        '</div></section>';
}

function categoryTabs() {
    const T = ROOFY.tr();
    const active = NEWS_CATS.indexOf(ROOFY.state.newsCategory) >= 0 ? ROOFY.state.newsCategory : 'all';
    return '<div class="flex flex-wrap gap-2">' +
        NEWS_CATS.map(function (k) {
            const isOn = active === k;
            return '<button onclick="setNewsCategory(\'' + k + '\')" class="text-sm font-medium px-4 h-10 rounded-full transition-colors ' +
                (isOn ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200') + '">' +
                T.news.categories[k] + '</button>';
        }).join('') +
        '</div>';
}

function articleCard(a, T) {
    const lang = ROOFY.state.lang;
    const title = lang === 'zh' ? a.titleZh : a.titleEn;
    const excerpt = lang === 'zh' ? a.excerptZh : a.excerptEn;
    const catLabel = T.news.categories[a.category] || a.category;
    return '<a href="/news/article.html?id=' + encodeURIComponent(a.id) + '" ' +
        'class="group block" data-reveal-up>' +
        '<div class="img-zoom relative aspect-[16/10] overflow-hidden bg-slate-100">' +
        '<img src="' + a.coverImg + '" data-placeholder="' + (a.placeholder ? 'true' : 'false') + '" alt="' + title + '" loading="lazy" class="w-full h-full object-cover" />' +
        '<div class="absolute top-4 left-4 flex items-center gap-2">' +
        '<span class="text-[10px] font-semibold uppercase tracking-wider bg-amber-500 text-slate-900 px-2.5 py-1">' + catLabel + '</span>' +
        (a.placeholder ? '<span class="text-[10px] font-semibold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2.5 py-1">' + T.news.sample + '</span>' : '') +
        '</div></div>' +
        '<div class="pt-5">' +
        '<div class="text-xs text-slate-500 mb-2">' + formatDate(a.publishedAt, lang) + '</div>' +
        '<h3 class="font-display text-xl font-semibold text-slate-900 mb-2 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">' + title + '</h3>' +
        '<p class="text-sm text-slate-500 leading-relaxed line-clamp-2">' + (excerpt || '') + '</p>' +
        '</div></a>';
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

function listingSection() {
    const T = ROOFY.tr();
    const filter = NEWS_CATS.indexOf(ROOFY.state.newsCategory) >= 0 ? ROOFY.state.newsCategory : 'all';
    const all = window.ROOFY_DATA.news || [];
    const list = (filter === 'all' ? all : all.filter(function (a) { return a.category === filter; }))
        .slice().sort(function (a, b) {
            return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
        });

    let cards;
    if (!all.length) {
        cards = '<div class="col-span-full text-center py-16 text-slate-500 text-sm">Loading…</div>';
    } else if (!list.length) {
        cards = '<div class="col-span-full text-center py-16 text-slate-500 text-sm">' + T.news.empty + '</div>';
    } else {
        cards = list.map(function (a) { return articleCard(a, T); }).join('');
    }

    return '<section id="news-list" class="py-12 lg:py-16 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8" data-reveal-up>' +
        '<div class="text-sm text-slate-600">' +
        (all.length ? (list.length + (ROOFY.state.lang === 'zh' ? ' 篇文章' : ' articles')) : '') +
        '</div>' +
        categoryTabs() +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '</div></section>';
}

function newsCtaBanner() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    return '<section class="relative py-16 lg:py-20 bg-slate-900 text-white overflow-hidden">' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">' +
        '<div class="lg:col-span-8">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">' +
        (lang === 'zh' ? '想第一时间收到更新？' : 'Want updates first?') + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-semibold text-white leading-tight">' +
        (lang === 'zh' ? '订阅 ROOFY 邮件简报 · 每周一封，仅看本地市场最关键的几条。' : 'Subscribe to the ROOFY brief · one email a week with the local market moves that matter.') +
        '</h2></div>' +
        '<div class="lg:col-span-4 lg:text-right">' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 transition-colors">' +
        (lang === 'zh' ? '联系我们订阅' : 'Get in touch') + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        newsHero() +
        listingSection() +
        newsCtaBanner() +
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
    /* Allow ?cat=lusaka shorthand to deep-link a category. */
    try {
        const cat = new URLSearchParams(location.search).get('cat');
        if (cat && NEWS_CATS.indexOf(cat) >= 0) ROOFY.state.newsCategory = cat;
    } catch (_) { }
    loadNewsData().then(function () { ROOFY.boot({ page: 'news' }); });
});
