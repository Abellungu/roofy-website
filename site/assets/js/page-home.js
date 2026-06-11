/* Home page — clean long-scroll layout in slate + amber register (references 模板1.html).
 * Section rhythm: dark hero → marquee → light news → slate-50 about → light mission/vision →
 *                 slate-50 values → light services → slate-50 featured →
 *                 light process → dark CTA → light contact teaser → dark footer.
 * Data: properties + news fetched at boot (news shown first per client direction 2026-06-11).
 */
window.ROOFY_DATA = window.ROOFY_DATA || { properties: [], news: [] };
window.ROOFY_PAGE = { id: 'home', whatsapp: 'home' };

function heroSection() {
    const T = ROOFY.tr();
    return '<section id="top" class="relative bg-slate-900 pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute inset-0">' +
        '<img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" data-placeholder="true" alt="" class="w-full h-full object-cover opacity-30" />' +
        '<div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-slate-900/60"></div>' +
        '</div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-3xl">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wider uppercase">' + T.hero.eyebrow + '</span></span>' +
        '<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"><span class="block reveal-mask"><span class="reveal-line">' + T.hero.title1 + '</span></span></h1>' +
        '<div class="reveal-mask mb-10"><p class="reveal-line text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl">' + T.hero.desc + '</p></div>' +
        '<div class="reveal-mask"><div class="reveal-line flex flex-wrap items-center gap-3">' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors shadow-lg shadow-amber-500/20">' +
        T.hero.primary + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<a href="/about.html" class="inline-flex items-center gap-2 border border-slate-600 hover:border-amber-500 hover:text-amber-400 text-white text-sm font-medium px-6 h-11 rounded-md transition-colors">' +
        T.hero.secondary + '</a>' +
        '</div></div></div></div></section>';
}

function marqueeSection() {
    const T = ROOFY.tr();
    const set = T.marquee.map(function (w) {
        return '<span class="text-sm text-slate-500 flex items-center gap-6">' + w + '<span class="text-amber-500/60">·</span></span>';
    }).join('');
    return '<section class="py-5 border-b border-slate-200 bg-white">' +
        '<div class="marquee"><div class="marquee__track">' + set + '</div><div class="marquee__track" aria-hidden="true">' + set + '</div></div>' +
        '</section>';
}

function newsSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const list = (window.ROOFY_DATA.news || []).slice(0, 3);
    if (!list.length) return '';
    const cards = list.map(function (a) {
        const title = lang === 'zh' ? a.titleZh : a.titleEn;
        const cat = (T.news.categories && T.news.categories[a.category]) || '';
        return '<a href="/news/article.html?id=' + encodeURIComponent(a.id) + '" data-reveal-up class="group block bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">' +
            '<div class="img-zoom relative aspect-[16/9] overflow-hidden bg-slate-100">' +
            '<img src="' + a.coverImg + '" data-placeholder="' + (a.placeholder ? 'true' : 'false') + '" alt="' + title + '" loading="lazy" class="w-full h-full object-cover" />' +
            (cat ? '<span class="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-900 px-2 py-0.5 rounded-md">' + cat + '</span>' : '') +
            '</div>' +
            '<div class="p-5">' +
            '<div class="text-xs text-slate-400 mb-2">' + (a.publishedAt || '') + '</div>' +
            '<h3 class="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">' + title + '</h3>' +
            '</div></a>';
    }).join('');
    return '<section class="py-20 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">' +
        '<div class="max-w-2xl">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.homeNews.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.homeNews.title + '</h2></div>' +
        '<a href="/news/index.html" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        T.homeNews.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '</div></section>';
}

function aboutSection() {
    const T = ROOFY.tr();
    return '<section id="about" class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">' +
        '<div class="lg:col-span-5" data-reveal-up>' +
        '<div class="aspect-[4/5] overflow-hidden rounded-xl bg-slate-200 shadow-lg">' +
        '<img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200" data-placeholder="true" alt="Architecture" class="w-full h-full object-cover" />' +
        '</div></div>' +
        '<div class="lg:col-span-7 lg:pt-4">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.about.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight" data-reveal-up>' + T.about.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed mb-4 max-w-xl" data-reveal-up>' + T.about.body + '</p>' +
        '<p class="text-slate-500 leading-relaxed mb-8 max-w-xl" data-reveal-up>' + T.about.body2 + '</p>' +
        '<a href="/about.html" class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors" data-reveal-up>' +
        T.about.cta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></section>';
}

function missionVisionSection() {
    const T = ROOFY.tr();
    function tile(eyebrow, title, desc) {
        return '<div class="p-8 lg:p-10 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow" data-reveal-up>' +
            '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + eyebrow + '</div>' +
            '<h3 class="text-2xl font-bold text-slate-900 mb-4">' + title + '</h3>' +
            '<p class="text-slate-600 leading-relaxed">' + desc + '</p>' +
            '</div>';
    }
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6">' +
        tile(T.mission.eyebrow, T.mission.title, T.mission.desc) +
        tile(T.vision.eyebrow, T.vision.title, T.vision.desc) +
        '</div></section>';
}

function valuesSection() {
    const T = ROOFY.tr();
    const items = T.values.items.map(function (v, i) {
        return '<div data-reveal-up class="group p-7 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow">' +
            '<div class="flex items-center justify-between mb-5">' +
            '<div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">' +
            '<i data-lucide="' + v.icon + '" class="w-6 h-6"></i></div>' +
            '<div class="text-xs text-slate-400 font-semibold">' + String(i + 1).padStart(2, '0') + '</div>' +
            '</div>' +
            '<h3 class="text-lg font-bold text-slate-900 mb-1">' + v.t + '</h3>' +
            '<div class="text-xs text-slate-500 mb-3 uppercase tracking-wider">' + v.e + '</div>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + v.d + '</p>' +
            '</div>';
    }).join('');
    return '<section id="values" class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.values.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.values.title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">' + items + '</div>' +
        '</div></section>';
}

function servicesSection() {
    const T = ROOFY.tr();
    const cards = T.services.items.map(function (s) {
        return '<article data-reveal-up class="group p-8 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-shadow duration-300">' +
            '<div class="flex items-center justify-between mb-6">' +
            '<div class="w-14 h-14 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">' +
            '<i data-lucide="' + s.icon + '" class="w-7 h-7"></i></div>' +
            '<div class="text-xs text-slate-400 font-semibold">' + s.tag + '</div>' +
            '</div>' +
            '<h3 class="text-xl font-bold text-slate-900 mb-3">' + s.title + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed mb-6">' + s.desc + '</p>' +
            '<a href="/' + s.href + '" class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">' +
            s.cta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
            '</article>';
    }).join('');
    return '<section id="services" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">' +
        '<div class="max-w-2xl">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.services.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.services.title + '</h2></div>' +
        '<a href="/about.html#process" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors">' +
        (ROOFY.state.lang === 'zh' ? '了解我们的工作流程' : 'See our process') +
        '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '</div></section>';
}

function featuredPropertiesSection() {
    const T = ROOFY.tr();
    const all = (window.ROOFY_DATA.properties || []);
    const list = (ROOFY.state.propertyFilter === 'all' ? all : all.filter(function (p) { return p.type === ROOFY.state.propertyFilter; })).slice(0, 6);
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
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.featured.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3" data-reveal-up>' + T.featured.title + '</h2>' +
        '<p class="text-slate-600" data-reveal-up>' + T.featured.subtitle + '</p></div>' +
        '<div class="flex flex-wrap gap-2">' + filterButtons + '</div></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '<div class="mt-12 flex justify-center">' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></section>';
}

function processSection() {
    const T = ROOFY.tr();
    const items = T.process.items.map(function (it) {
        return '<div data-reveal-up>' +
            '<div class="text-3xl font-bold text-amber-500 mb-3">' + it.n + '</div>' +
            '<h3 class="text-lg font-bold text-slate-900 mb-2">' + it.t + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + it.d + '</p></div>';
    }).join('');
    return '<section id="process" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.process.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.process.title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">' + items + '</div>' +
        '</div></section>';
}

function ctaBannerSection() {
    const T = ROOFY.tr();
    return '<section class="relative py-20 lg:py-28 bg-slate-900 text-white overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 rounded-md transition-colors shadow-lg shadow-amber-500/20" data-reveal-up>' +
        T.cta.ctaBtn + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

function contactTeaserSection() {
    const T = ROOFY.tr();
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">' +
        '<div class="lg:col-span-5">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.contact.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-5" data-reveal-up>' + T.contact.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed mb-8 max-w-md" data-reveal-up>' + T.contact.desc + '</p>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors shadow-sm" data-reveal-up>' +
        T.cta.contact + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4" data-reveal-up>' +
        contactTile(T.contact.address, T.contact.addressV, 'map-pin') +
        contactTile(T.contact.phone, T.contact.phoneV, 'phone') +
        contactTile(T.contact.email, T.contact.emailV, 'mail') +
        contactTile(T.contact.hours, T.contact.hoursV1 + '\n' + T.contact.hoursV2, 'clock') +
        '</div></div></section>';
}

function contactTile(label, value, icon) {
    return '<div class="p-5 bg-slate-50 border border-slate-100 rounded-xl">' +
        '<div class="flex items-center gap-2 mb-3">' +
        '<div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">' +
        '<i data-lucide="' + icon + '" class="w-4 h-4"></i></div>' +
        '<div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">' + label + '</div></div>' +
        '<div class="text-sm text-slate-800 leading-relaxed whitespace-pre-line">' + value + '</div>' +
        '</div>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        heroSection() +
        marqueeSection() +
        newsSection() +
        aboutSection() +
        missionVisionSection() +
        valuesSection() +
        servicesSection() +
        featuredPropertiesSection() +
        processSection() +
        ctaBannerSection() +
        contactTeaserSection() +
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
