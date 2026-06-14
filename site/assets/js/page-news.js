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
    const lang = ROOFY.state.lang;
    const latest = (window.ROOFY_DATA.news || [])[0];
    const photo = (latest && latest.coverImg) ? latest.coverImg : '/assets/img/stock/u1495020689067.jpg';
    const cap = latest ? (lang === 'zh' ? latest.titleZh : latest.titleEn) : '';
    return '<section class="relative bg-amber-500 pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden" data-hero-reveal>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">' +
        '<div class="lg:col-span-7">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line roofy-eyebrow inline-flex text-xs font-bold tracking-[0.25em] text-slate-900 uppercase">' + T.news.eyebrow + '</span></span>' +
        '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.1] mb-5"><span class="block reveal-mask"><span class="reveal-line">' + T.news.title + '</span></span></h1>' +
        '<div class="reveal-mask max-w-xl"><p class="reveal-line text-base text-slate-800 leading-relaxed">' + T.news.desc + '</p></div>' +
        '</div>' +
        '<div class="lg:col-span-5 hidden lg:block">' +
        '<a href="/news/article.html?id=' + (latest ? encodeURIComponent(latest.id) : '') + '" class="relative block" data-reveal-up>' +
        '<div class="absolute -top-4 -right-4 left-10 bottom-10 border border-slate-900/30 pointer-events-none"></div>' +
        '<div class="relative overflow-hidden img-zoom">' +
        '<img src="' + photo + '" alt="" class="w-full aspect-[4/5] object-cover" />' +
        '<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-5 pt-20">' +
        (latest ? '<div class="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400 mb-1.5">' + (lang === 'zh' ? '最新 · Latest' : 'Latest') + '</div>' : '') +
        '<div class="text-sm font-semibold text-white leading-snug">' + cap + '</div>' +
        '</div></div></a>' +
        '</div></div></div></section>';
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
        'class="group block bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300" data-reveal-up>' +
        '<div class="img-zoom relative aspect-[16/10] overflow-hidden bg-slate-100">' +
        '<img src="' + a.coverImg + '" data-placeholder="' + (a.placeholder ? 'true' : 'false') + '" alt="' + title + '" loading="lazy" class="w-full h-full object-cover" />' +
        '<div class="absolute top-3 left-3 flex items-center gap-2">' +
        '<span class="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-900 px-2.5 py-1 rounded-sm shadow-sm">' + catLabel + '</span>' +
        (a.placeholder ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-sm">' + T.news.sample + '</span>' : '') +
        '</div></div>' +
        '<div class="p-5">' +
        '<div class="text-xs text-slate-500 mb-2">' + formatDate(a.publishedAt, lang) + '</div>' +
        '<h3 class="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">' + title + '</h3>' +
        '<p class="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">' + (excerpt || '') + '</p>' +
        '<div class="inline-flex items-center gap-2 text-xs font-semibold text-amber-600">' +
        T.news.readMore + '<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></div>' +
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
    return '<section class="relative py-16 lg:py-20 bg-amber-500 text-slate-900 overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-slate-900/10 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">' +
        '<div class="lg:col-span-8">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">' +
        (lang === 'zh' ? '想第一时间收到更新？' : 'Want updates first?') + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">' +
        (lang === 'zh' ? '订阅 ROOFY 邮件简报 · 每周一封，仅看本地市场最关键的几条。' : 'Subscribe to the ROOFY brief · one email a week with the local market moves that matter.') +
        '</h2></div>' +
        '<div class="lg:col-span-4 lg:text-right">' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 h-11 rounded-sm transition-colors">' +
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
