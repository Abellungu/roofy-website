/* Home page — clean long-scroll layout in slate + amber register (references 模板1.html).
 * Section rhythm: dark hero → light news → slate-50 about → light mission/vision →
 *                 slate-50 values → light services → slate-50 featured →
 *                 light process → dark CTA → light contact teaser → dark footer.
 * Data: properties + news fetched at boot (news shown first per client direction 2026-06-11).
 */
window.ROOFY_DATA = window.ROOFY_DATA || { properties: [], news: [] };
window.ROOFY_PAGE = { id: 'home', whatsapp: 'home' };

function heroSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    return '<section id="top" class="relative bg-amber-500 pt-28 lg:pt-40 pb-14 lg:pb-20 overflow-hidden" data-hero-reveal>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">' +
        '<div class="lg:col-span-7">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line roofy-eyebrow inline-flex text-xs font-bold tracking-[0.25em] text-slate-900 uppercase">' + T.hero.eyebrow + '</span></span>' +
        '<h1 class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.06] mb-7"><span class="block reveal-mask"><span class="reveal-line">' + T.hero.title1 + '</span></span></h1>' +
        '<div class="reveal-mask mb-10"><p class="reveal-line text-base lg:text-lg text-slate-800 leading-relaxed max-w-xl">' + T.hero.desc + '</p></div>' +
        '<div class="reveal-mask"><div class="reveal-line flex flex-wrap items-center gap-3">' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 h-12 rounded-sm transition-colors">' +
        T.hero.primary + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<a href="/about.html" class="inline-flex items-center gap-2 border border-slate-900/40 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 text-sm font-medium px-6 h-12 rounded-sm transition-colors">' +
        T.hero.secondary + '</a>' +
        '</div></div>' +
        '</div>' +
        '<div class="lg:col-span-5 hidden lg:block">' +
        '<div class="relative" data-reveal-up>' +
        '<div class="absolute -top-4 -right-4 left-10 bottom-10 border border-slate-900/30 pointer-events-none"></div>' +
        '<div class="relative overflow-hidden img-zoom">' +
        '<img src="/assets/img/projects/oasis-miracle-aerial.jpg" alt="Oasis Miracle, Ibex Hill" class="w-full aspect-[4/5] object-cover" />' +
        '<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-5 pt-16">' +
        '<div class="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400">Oasis Miracle · Ibex Hill</div>' +
        '<div class="text-xs text-slate-200 mt-1">' + (lang === 'zh' ? '集团真实交付 · 78 户社区一年售罄' : 'Delivered by our group · 78 homes, sold out in one year') + '</div>' +
        '</div></div></div>' +
        '</div></div>' +
        '<div class="reveal-mask mt-12 lg:mt-16"><div class="reveal-line border-t border-slate-900/25 pt-5 flex flex-wrap gap-x-10 gap-y-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-slate-800/70">' +
        '<span>EST \u00b7 2024</span><span>Ibex Hill \u00b7 Lusaka</span><span>15\u00b025\u2032S \u00b7 28\u00b017\u2032E</span><span class="text-slate-900">Build \u00b7 Brand \u00b7 Grow</span>' +
        '</div></div></div></section>';
}

function newsSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const list = (window.ROOFY_DATA.news || []).slice(0, 3);
    if (!list.length) return '';
    function meta(a) {
        const cat = (T.news.categories && T.news.categories[a.category]) || '';
        return '<span class="text-amber-600 font-semibold">' + cat + '</span><span class="text-slate-300">/</span><span>' + (a.publishedAt || '') + '</span>';
    }
    const a0 = list[0];
    const lead = '<a href="/news/article.html?id=' + encodeURIComponent(a0.id) + '" class="group block lg:col-span-7" data-reveal-up>' +
        '<div class="img-zoom overflow-hidden mb-5"><img src="' + a0.coverImg + '" alt="' + (lang === 'zh' ? a0.titleZh : a0.titleEn) + '" loading="lazy" class="w-full aspect-[16/9] object-cover" /></div>' +
        '<div class="flex items-center gap-2 text-xs mb-3 text-slate-500">' + meta(a0) + '</div>' +
        '<h3 class="text-2xl lg:text-3xl font-bold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors max-w-xl">' + (lang === 'zh' ? a0.titleZh : a0.titleEn) + '</h3>' +
        '<p class="text-sm text-slate-600 leading-relaxed mt-3 max-w-xl">' + (lang === 'zh' ? (a0.excerptZh || '') : (a0.excerptEn || '')) + '</p>' +
        '</a>';
    const side = list.slice(1, 3).map(function (a, i) {
        return '<a href="/news/article.html?id=' + encodeURIComponent(a.id) + '" class="group flex gap-5 items-start' + (i > 0 ? ' border-t border-slate-200 pt-7' : '') + '" data-reveal-up>' +
            '<div class="img-zoom overflow-hidden w-32 sm:w-40 shrink-0"><img src="' + a.coverImg + '" alt="" loading="lazy" class="w-full aspect-[4/3] object-cover" /></div>' +
            '<div class="min-w-0">' +
            '<div class="flex items-center gap-2 text-xs mb-2 text-slate-500">' + meta(a) + '</div>' +
            '<h3 class="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">' + (lang === 'zh' ? a.titleZh : a.titleEn) + '</h3>' +
            '</div></a>';
    }).join('');
    return '<section class="py-20 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex items-end justify-between gap-6 mb-10">' +
        '<div>' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.homeNews.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.homeNews.title + '</h2></div>' +
        '<a href="/news/index.html" class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors shrink-0" data-reveal-up>' +
        T.homeNews.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">' + lead +
        '<div class="lg:col-span-5 flex flex-col gap-7 lg:pt-2">' + side + '</div>' +
        '</div></div></section>';
}

/* Merged "who we are" block: company intro + mission/vision + a compact values
 * strip. The full mission/vision/values/team live on /about; the home only needs
 * the highlight. (2026-06-16 home consolidation, plan B.) */
function whoWeAreSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    function mvTile(idx, eyebrow, title, desc) {
        return '<div class="relative border-t-2 border-amber-500 pt-7" data-reveal-up>' +
            '<span class="absolute -top-2 right-0 text-6xl lg:text-7xl font-black text-slate-900/[0.05] leading-none select-none pointer-events-none">' + idx + '</span>' +
            '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + eyebrow + '</div>' +
            '<h3 class="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 max-w-md">' + title + '</h3>' +
            '<p class="text-slate-600 leading-relaxed max-w-lg">' + desc + '</p>' +
            '</div>';
    }
    const valueWords = (T.values.items || []).map(function (v) {
        return '<span class="text-lg lg:text-xl font-bold text-slate-900">' + v.t + '</span>';
    }).join('<span class="text-amber-500 mx-3" aria-hidden="true">·</span>');
    return '<section id="about" class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 lg:mb-24">' +
        '<div class="lg:col-span-5" data-reveal-up>' +
        '<div class="aspect-[4/5] overflow-hidden rounded-lg bg-slate-200 shadow-lg">' +
        '<img src="/assets/img/office/office-terrace.jpg" alt="ROOFY · Ibex Hill, Lusaka" class="w-full h-full object-cover" />' +
        '</div></div>' +
        '<div class="lg:col-span-7">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.about.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight" data-reveal-up>' + T.about.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed mb-4 max-w-xl" data-reveal-up>' + T.about.body + '</p>' +
        '<p class="text-slate-500 leading-relaxed mb-8 max-w-xl" data-reveal-up>' + T.about.body2 + '</p>' +
        '<a href="/about.html" class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors" data-reveal-up>' +
        T.about.cta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div>' +
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-x-14 gap-y-12 mb-14 lg:mb-16">' +
        mvTile('01', T.mission.eyebrow, T.mission.title, T.mission.desc) +
        mvTile('02', T.vision.eyebrow, T.vision.title, T.vision.desc) +
        '</div>' +
        '<div id="values" class="border-t-2 border-slate-900 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-reveal-up>' +
        '<div>' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">' + T.values.eyebrow + '</div>' +
        '<div class="flex flex-wrap items-center">' + valueWords + '</div>' +
        '</div>' +
        '<a href="/about.html" class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors shrink-0">' +
        (lang === 'zh' ? '了解我们的价值观' : 'Our values') + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '</div></section>';
}

function servicesSection() {
    const T = ROOFY.tr();
    const rows = T.services.items.map(function (s) {
        return '<a href="/' + s.href + '" data-reveal-up class="group grid grid-cols-12 gap-x-4 gap-y-3 items-start border-t border-slate-200 py-8 lg:py-10 transition-colors duration-300 hover:bg-amber-50/70 lg:px-4 lg:-mx-4">' +
            '<div class="col-span-2 lg:col-span-1 text-2xl lg:text-3xl font-bold text-slate-300 group-hover:text-amber-500 transition-colors">' + s.tag + '</div>' +
            '<h3 class="col-span-10 lg:col-span-4 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">' + s.title + '</h3>' +
            '<p class="col-span-10 col-start-3 lg:col-span-5 lg:col-start-auto text-sm text-slate-600 leading-relaxed lg:pt-1.5">' + s.desc + '</p>' +
            '<div class="col-span-2 col-start-11 lg:col-span-2 flex lg:justify-end">' +
            '<span class="inline-flex w-11 h-11 border border-slate-300 text-slate-500 group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-slate-900 items-center justify-center transition-colors">' +
            '<i data-lucide="arrow-up-right" class="w-4 h-4"></i></span></div>' +
            '</a>';
    }).join('');
    return '<section id="services" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.services.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.services.title + '</h2></div>' +
        '<div class="border-b border-slate-200">' + rows + '</div>' +
        '</div></section>';
}

function featuredPropertiesSection() {
    const T = ROOFY.tr();
    const all = (window.ROOFY_DATA.properties || []);
    const list = (ROOFY.state.propertyFilter === 'all' ? all : all.filter(function (p) { return p.type === ROOFY.state.propertyFilter; })).slice(0, 3);
    const filterButtons = ['all', 'new', 'resale', 'rent', 'land'].map(function (k) {
        const active = ROOFY.state.propertyFilter === k;
        return '<button onclick="setFilter(\'' + k + '\')" class="text-sm font-medium px-4 h-9 rounded-full transition-colors ' +
            (active ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200') + '">' + T.featured.filters[k] + '</button>';
    }).join('');

    let cards;
    if (list.length === 0) {
        cards = '<div class="col-span-full text-center py-16 text-slate-500 text-sm">Loading listings…</div>';
    } else {
        cards = list.map(function (p) { return window.propertyCard(p, T); }).join('');
    }

    return '<section id="properties" class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.featured.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3" data-reveal-up>' + T.featured.title + '</h2>' +
        '<p class="text-slate-600" data-reveal-up>' + T.featured.subtitle + '</p></div>' +
        '<div class="flex flex-wrap gap-2">' + filterButtons + '</div></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '<div class="mt-12 flex justify-center" data-reveal-up>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-8 h-12 rounded-sm transition-colors shadow-lg shadow-amber-500/20">' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></section>';
}

function ctaBannerSection() {
    const T = ROOFY.tr();
    return '<section class="relative py-20 lg:py-28 bg-amber-500 text-slate-900 overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-slate-900/10 blur-3xl pointer-events-none"></div>' +
        '<div class="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-slate-900/5 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-bold text-slate-900 max-w-3xl mx-auto mb-10 leading-tight text-balance" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-7 h-12 rounded-sm transition-colors shadow-lg shadow-slate-900/20" data-reveal-up>' +
        T.cta.ctaBtn + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<div class="mt-10 pt-8 border-t border-slate-900/15 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-900/80" data-reveal-up>' +
        '<span class="inline-flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4"></i>' + T.contact.addressV + '</span>' +
        '<a href="tel:+260964813736" class="inline-flex items-center gap-2 hover:text-slate-900 transition-colors"><i data-lucide="phone" class="w-4 h-4"></i>' + T.contact.phoneV + '</a>' +
        '<a href="mailto:roofy@mingyangrt.com" class="inline-flex items-center gap-2 hover:text-slate-900 transition-colors"><i data-lucide="mail" class="w-4 h-4"></i>' + T.contact.emailV + '</a>' +
        '</div>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        heroSection() +
        newsSection() +
        whoWeAreSection() +
        servicesSection() +
        featuredPropertiesSection() +
        ctaBannerSection() +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadHomeData() {
    return Promise.all([
        fetch('/assets/data/properties.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
        fetch('/assets/data/news.json').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (res) {
        window.ROOFY_DATA.properties = (res[0] && res[0].items) || [];
        const articles = (res[1] && res[1].articles) || [];
        window.ROOFY_DATA.news = articles.slice().sort(function (a, b) {
            return (b.publishedAt || '').localeCompare(a.publishedAt || '');
        });
    });
}

window.addEventListener('DOMContentLoaded', function () {
    loadHomeData().then(function () { ROOFY.boot({ page: 'home' }); });
});
