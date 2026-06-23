/* Home page — service-oriented property-portal layout (2026-06-17 redesign).
 * Direction: function-led, NOT company-intro (搜房网-style). Search hero
 * (deep-links to /properties) → latest listings → group projects → news →
 * compact services row → CTA. The full "who we are" / mission / vision /
 * values now live only on /about.
 * Section rhythm: amber hero → white listings → slate-50 projects →
 *                 white news → slate-50 services → amber CTA → dark footer.
 * Data: properties + news + projects fetched at boot.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { properties: [], news: [], projects: [] };
window.ROOFY_PAGE = { id: 'home', whatsapp: 'home' };

function escapeAttr(s) {
    return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Home search bar → /properties deep-link (?txn=&region=&type=&q=). The
 * properties page parses these params on boot, so the home search reuses its
 * full filter — no duplicate filtering logic here. Handlers are on window so
 * the inline onclick/onsubmit strings resolve (see CLAUDE.md render lifecycle). */
window.setHomeTxn = function (btn, v) {
    const hidden = document.getElementById('home-txn');
    if (hidden) hidden.value = v;
    Array.prototype.forEach.call(document.querySelectorAll('.home-txn'), function (b) {
        const on = b.getAttribute('data-txn') === v;
        b.classList.toggle('bg-slate-900', on);
        b.classList.toggle('text-white', on);
        b.classList.toggle('text-slate-600', !on);
    });
};

window.homeSearch = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }
    const txn = val('home-txn') || 'all';
    const region = val('home-region');
    const type = val('home-type') || 'all';
    const beds = val('home-beds') || 'all';
    const kw = (val('home-kw') || '').trim();
    const params = new URLSearchParams();
    if (txn && txn !== 'all') params.set('txn', txn);
    if (region) params.set('region', region);
    if (type && type !== 'all') params.set('type', type);
    if (beds && beds !== 'all') params.set('beds', beds);
    if (kw) params.set('q', kw);
    const qs = params.toString();
    window.location.href = '/properties/index.html' + (qs ? '?' + qs : '');
    return false;
};

/* Search hero, portal style (Phase A redesign 2026-06-23, ref Roofy.greenwebb.tech):
 * a light gold-tinted band with an oversized two-tone Montserrat ExtraBold headline
 * (navy + gold-gradient accent), a full-width tabbed search panel (sale/rent +
 * keyword / region / type / bedrooms), popular quick-links, and a wide flagship
 * image band. Centered composition; the headline scales 41px → 100px across breakpoints. */
function heroSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const regions = T.properties.regions || {};
    const regionOpts = '<option value="">' + T.properties.regionAll + '</option>' +
        Object.keys(regions).map(function (k) {
            return '<option value="' + k + '">' + regions[k] + '</option>';
        }).join('');
    const typeOpts = ['all', 'new', 'resale', 'land'].map(function (k) {
        return '<option value="' + k + '">' + T.featured.filters[k] + '</option>';
    }).join('');
    const bedsOpts = ['all', '1', '3', '4', '5'].map(function (k) {
        return '<option value="' + k + '">' + T.properties.beds[k] + '</option>';
    }).join('');
    const regionKeys = Object.keys(regions);
    const chipDefs = regionKeys.slice(0, 3).map(function (k) {
        return { label: regions[k], href: '/properties/index.html?region=' + encodeURIComponent(k) };
    });
    chipDefs.push({ label: T.featured.filters.land, href: '/properties/index.html?type=land' });
    chipDefs.push({ label: T.properties.transaction.rent, href: '/properties/index.html?txn=rent' });
    const chips = chipDefs.map(function (c) {
        return '<a href="' + c.href + '" class="inline-flex items-center px-3.5 h-8 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-sm font-medium transition-colors">' + c.label + '</a>';
    }).join('');
    const selCls = 'h-12 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors';

    const searchPanel =
        '<form onsubmit="return homeSearch(event)" class="bg-white rounded-xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5 p-4 sm:p-5 text-left max-w-4xl mx-auto" data-reveal-up>' +
        '<div class="inline-flex mb-3 rounded-md border border-slate-200 overflow-hidden text-sm font-semibold">' +
        '<button type="button" onclick="setHomeTxn(this,\'sale\')" data-txn="sale" class="home-txn px-7 h-9 bg-slate-900 text-white transition-colors">' + T.properties.transaction.sale + '</button>' +
        '<button type="button" onclick="setHomeTxn(this,\'rent\')" data-txn="rent" class="home-txn px-7 h-9 text-slate-600 hover:bg-slate-50 transition-colors">' + T.properties.transaction.rent + '</button>' +
        '</div>' +
        '<input type="hidden" id="home-txn" value="sale">' +
        '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">' +
        '<input id="home-kw" type="text" placeholder="' + escapeAttr(T.hero.kwPlaceholder) + '" class="' + selCls + ' placeholder-slate-400">' +
        '<select id="home-region" class="' + selCls + '" aria-label="' + escapeAttr(T.properties.regionLabel) + '">' + regionOpts + '</select>' +
        '<select id="home-type" class="' + selCls + '" aria-label="' + escapeAttr(T.properties.typeLabel) + '">' + typeOpts + '</select>' +
        '<select id="home-beds" class="' + selCls + '" aria-label="' + escapeAttr(T.properties.bedsLabel) + '">' + bedsOpts + '</select>' +
        '</div>' +
        '<button type="submit" class="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gold-gradient hover:brightness-105 text-slate-900 font-bold text-sm h-12 rounded-md transition-all shadow-lg shadow-amber-500/25">' +
        '<i data-lucide="search" class="w-4 h-4"></i>' + T.hero.searchBtn + '</button>' +
        '</form>';

    const imageBand =
        '<div class="relative mt-12 lg:mt-16 overflow-hidden rounded-2xl img-zoom shadow-xl shadow-slate-900/15 max-w-[1180px] mx-auto" data-reveal-up>' +
        '<img src="/assets/img/projects/oasis-miracle-pool.jpg" alt="Oasis Miracle, Ibex Hill" loading="lazy" class="w-full h-[220px] sm:h-[300px] lg:h-[360px] object-cover" />' +
        '<div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>' +
        '<div class="absolute left-5 bottom-4 sm:left-7 sm:bottom-6 text-left">' +
        '<div class="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400">Oasis Miracle · Ibex Hill</div>' +
        '<div class="text-xs sm:text-sm text-slate-100 mt-1 font-medium">' + (lang === 'zh' ? '集团真实交付 · 78 户社区一年售罄' : 'Delivered by our group · 78 homes, sold out in a year') + '</div>' +
        '</div></div>';

    return '<section id="top" class="relative bg-gradient-to-b from-slate-50 via-white to-white pt-28 lg:pt-32 pb-16 lg:pb-20 overflow-hidden" data-hero-reveal>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<span class="reveal-mask inline-block mb-5 max-w-full"><span class="reveal-line roofy-eyebrow inline-flex text-[10px] sm:text-xs font-bold tracking-[0.18em] sm:tracking-[0.25em] text-amber-600 uppercase">' + T.hero.eyebrow + '</span></span>' +
        '<h1 class="font-extrabold tracking-tight text-slate-900 leading-[0.98] mb-5 text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[6.25rem] mx-auto max-w-5xl"><span class="block reveal-mask"><span class="reveal-line">' + T.hero.heroLead + ' <span class="text-gold-gradient">' + T.hero.heroAccent + '</span></span></span></h1>' +
        '<div class="reveal-mask mb-9"><p class="reveal-line text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">' + T.hero.desc + '</p></div>' +
        searchPanel +
        '<div class="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5" data-reveal-up>' +
        '<span class="text-xs font-bold tracking-[0.18em] uppercase text-slate-500 mr-1">' + T.hero.popular + '</span>' + chips +
        '</div>' +
        imageBand +
        '</div></section>';
}

/* Featured listings as a Swiper carousel (Phase B, ref roofy.greenwebb.tech):
 * real-photo property cards, 1 / 2 / 3 per view, autoplay + drag + arrows +
 * pagination. (Re)initialised by window.onRoofyRender after each render. */
function featuredPropertiesSection() {
    const T = ROOFY.tr();
    const all = (window.ROOFY_DATA.properties || []);
    const list = all.slice(0, 9);

    let slides;
    if (list.length === 0) {
        slides = '<div class="swiper-slide"><div class="text-center py-16 text-slate-500 text-sm">Loading listings…</div></div>';
    } else {
        slides = list.map(function (p) { return '<div class="swiper-slide">' + window.propertyCard(p, T) + '</div>'; }).join('');
    }

    return '<section id="properties" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.featured.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3" data-reveal-up>' + T.featured.title + '</h2>' +
        '<p class="text-slate-600" data-reveal-up>' + T.featured.subtitle + '</p></div>' +
        '<div class="flex items-center gap-2 shrink-0" data-reveal-up>' +
        '<button type="button" class="featured-prev inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors" aria-label="Previous"><i data-lucide="arrow-left" class="w-4 h-4"></i></button>' +
        '<button type="button" class="featured-next inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors" aria-label="Next"><i data-lucide="arrow-right" class="w-4 h-4"></i></button>' +
        '</div></div>' +
        '<div class="featured-swiper swiper" data-reveal-up><div class="swiper-wrapper">' + slides + '</div></div>' +
        '<div class="featured-pagination mt-8 flex justify-center gap-2"></div>' +
        '<div class="mt-10 flex justify-center" data-reveal-up>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-gold-gradient hover:brightness-105 text-slate-900 font-bold text-sm px-8 h-12 rounded-md transition-all shadow-lg shadow-amber-500/25">' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></section>';
}

/* Count-up stats band (Phase A: number-roll animation via roofy-core's
 * [data-counter] GSAP). Initial text = target so reduced-motion / no-JS still
 * shows the value. */
function statsSection() {
    const T = ROOFY.tr();
    const n = (window.ROOFY_DATA.properties || []).length || 6;
    const items = [
        { target: 2024, suffix: '', label: T.stats.founded },
        { target: 78, suffix: '', label: T.stats.homes },
        { target: 3, suffix: '', label: T.stats.practices },
        { target: n, suffix: '+', label: T.stats.listings }
    ];
    const cells = items.map(function (it) {
        return '<div class="text-center" data-reveal-up>' +
            '<div class="text-gold-gradient font-extrabold text-5xl lg:text-6xl leading-none" data-counter data-target="' + it.target + '" data-suffix="' + it.suffix + '">' + it.target + it.suffix + '</div>' +
            '<div class="mt-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">' + it.label + '</div>' +
            '</div>';
    }).join('');
    return '<section class="py-16 lg:py-20 bg-slate-900">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">' + cells + '</div>' +
        '</div></section>';
}

/* Post-render hook (called by roofy-core after every render): (re)build the
 * featured carousel. Autoplay is disabled under reduced-motion. */
window.onRoofyRender = function () {
    if (typeof Swiper === 'undefined') return;
    if (window._featSwiper && window._featSwiper.destroy) {
        try { window._featSwiper.destroy(true, true); } catch (_) { }
        window._featSwiper = null;
    }
    var el = document.querySelector('.featured-swiper');
    if (!el) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window._featSwiper = new Swiper(el, {
        slidesPerView: 1.15,
        spaceBetween: 20,
        grabCursor: true,
        loop: el.querySelectorAll('.swiper-slide').length > 3,
        breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 22 },
            1024: { slidesPerView: 3, spaceBetween: 24 }
        },
        autoplay: reduce ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.featured-pagination', clickable: true },
        navigation: { nextEl: '.featured-next', prevEl: '.featured-prev' }
    });
};

/* Group flagship projects (Crown / Miracle / Serenity). Mirrors the band on
 * the properties page; cards link to /projects/<slug>.html (prerendered). */
function projectsBandSection() {
    const T = ROOFY.tr();
    if (!T.projects) return '';
    const lang = ROOFY.state.lang;
    const projects = window.ROOFY_DATA.projects || [];
    if (!projects.length) return '';

    function statusBadge(status) {
        const label = (T.projects.statusLabels && T.projects.statusLabels[status]) || status;
        const tone = {
            selling: 'bg-amber-500 text-slate-900',
            delivered: 'bg-leaf-500 text-white',
            'sold-out': 'bg-leaf-600 text-white',
            'under-construction': 'bg-slate-200 text-slate-900',
            upcoming: 'bg-slate-700 text-white'
        }[status] || 'bg-slate-200 text-slate-900';
        return '<span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ' + tone + '">' + label + '</span>';
    }

    const cards = projects.map(function (p) {
        const name = lang === 'zh' ? p.nameZh : p.nameEn;
        const tagline = lang === 'zh' ? p.taglineZh : p.taglineEn;
        const propertyType = lang === 'zh' ? p.propertyTypeZh : p.propertyTypeEn;
        return '<a href="/projects/' + encodeURIComponent(p.id) + '.html" ' +
            'class="group flex flex-col h-full bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300" data-reveal-up>' +
            '<div class="img-zoom relative aspect-[5/4] overflow-hidden bg-slate-100 shrink-0">' +
            '<img src="' + p.heroImg + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + escapeAttr(name) + '" loading="lazy" class="w-full h-full object-cover" />' +
            '<div class="absolute top-3 left-3 flex flex-col items-start gap-1.5">' + statusBadge(p.status) +
            (p.placeholder ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-sm">' + T.projects.sample + '</span>' : '') +
            '</div></div>' +
            '<div class="p-5 flex flex-col flex-1">' +
            '<div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">' +
            '<i data-lucide="map-pin" class="w-3 h-3 shrink-0"></i>' + (p.location || '') + '</div>' +
            '<h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">' + name + '</h3>' +
            '<p class="text-sm text-slate-600 leading-snug mb-4 line-clamp-2 flex-1">' + (tagline || '') + '</p>' +
            '<div class="pt-4 border-t border-slate-100 mt-auto">' +
            '<div class="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">' + T.projects.specs.priceRange + '</div>' +
            '<div class="text-amber-600 font-bold text-lg whitespace-nowrap mb-2">' + (p.priceRange || T.projects.priceOnRequest) + '</div>' +
            '<div class="text-xs text-slate-500 leading-snug">' + (propertyType || '') + '</div>' +
            '</div></div></a>';
    }).join('');

    return '<section class="py-20 lg:py-24 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10" data-reveal-up>' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + T.projects.sectionEyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">' + T.projects.sectionTitle + '</h2>' +
        '<p class="text-slate-600">' + T.projects.sectionDesc + '</p>' +
        '</div></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">' + cards + '</div>' +
        '</div></section>';
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

/* Compact services row — function navigation to the three pillar pages, not a
 * company write-up. */
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
    return '<section id="services" class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.services.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.services.title + '</h2></div>' +
        '<div class="border-b border-slate-200">' + rows + '</div>' +
        '</div></section>';
}

function ctaBannerSection() {
    const T = ROOFY.tr();
    return '<section class="relative py-20 lg:py-28 bg-slate-900 text-white overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto mb-10 leading-tight text-balance" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-gold-gradient hover:brightness-105 text-slate-900 font-bold text-sm px-7 h-12 rounded-sm transition-all shadow-lg shadow-amber-500/25" data-reveal-up>' +
        T.cta.ctaBtn + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<div class="mt-10 pt-8 border-t border-white/15 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-300" data-reveal-up>' +
        '<span class="inline-flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-amber-400"></i>' + T.contact.addressV + '</span>' +
        '<a href="tel:+260964813736" class="inline-flex items-center gap-2 hover:text-white transition-colors"><i data-lucide="phone" class="w-4 h-4 text-amber-400"></i>' + T.contact.phoneV + '</a>' +
        '<a href="mailto:roofy@mingyangrt.com" class="inline-flex items-center gap-2 hover:text-white transition-colors"><i data-lucide="mail" class="w-4 h-4 text-amber-400"></i>' + T.contact.emailV + '</a>' +
        '</div>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        heroSection() +
        featuredPropertiesSection() +
        statsSection() +
        projectsBandSection() +
        newsSection() +
        servicesSection() +
        ctaBannerSection() +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadHomeData() {
    return Promise.all([
        fetch('/assets/data/properties.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
        fetch('/assets/data/news.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
        fetch('/assets/data/projects.json').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (res) {
        window.ROOFY_DATA.properties = (res[0] && res[0].items) || [];
        const articles = (res[1] && res[1].articles) || [];
        window.ROOFY_DATA.news = articles.slice().sort(function (a, b) {
            return (b.publishedAt || '').localeCompare(a.publishedAt || '');
        });
        window.ROOFY_DATA.projects = (res[2] && res[2].projects) || [];
    });
}

window.addEventListener('DOMContentLoaded', function () {
    loadHomeData().then(function () { ROOFY.boot({ page: 'home' }); });
});
