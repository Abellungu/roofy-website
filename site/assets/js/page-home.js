/* Home page — premium redesign 2026-06-29.
 * IA: cinematic hero with a glassmorphism property search → three co-equal
 * businesses → featured listings → flagship projects → news → contact CTA.
 * Cormorant display serif, off-white surfaces, champagne gold, sharp corners.
 * Data: properties + news + projects fetched at boot. */
window.ROOFY_DATA = window.ROOFY_DATA || { properties: [], news: [], projects: [] };
window.ROOFY_PAGE = { id: 'home', whatsapp: 'home' };

function escapeAttr(s) {
    return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Hero search → /properties deep-link (?txn=&region=&type=&q=). The properties
 * page parses these on boot, so the home search reuses its full filter. */
window.setHomeTxn = function (btn, v) {
    const hidden = document.getElementById('home-txn');
    if (hidden) hidden.value = v;
    Array.prototype.forEach.call(document.querySelectorAll('.home-txn'), function (b) {
        const on = b.getAttribute('data-txn') === v;
        b.classList.toggle('bg-amber-500', on);
        b.classList.toggle('text-slate-900', on);
        b.classList.toggle('bg-white/10', !on);
        b.classList.toggle('text-white', !on);
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

/* Cinematic hero: full-bleed city-at-night image, oversized editorial headline
 * (white + gold), and two clear CTAs. The navbar runs transparent over the hero
 * and turns solid past it (initNavMode). */
function heroSection() {
    const T = ROOFY.tr();
    const joiner = ROOFY.state.lang === 'zh' ? '' : ' ';
    const heroImg = '/assets/img/home/home-hero-city-night.jpg';

    return '<section id="top" class="home-hero hero-cinematic relative min-h-[100svh] min-h-[100dvh] flex" style="background-image:url(\'' + heroImg + '\')" data-hero-reveal>' +
        '<div class="relative w-full max-w-[1280px] mx-auto px-6 lg:px-10 flex items-end md:items-center pt-28 pb-16 md:pb-12 lg:pt-32 lg:pb-16">' +
        '<div class="max-w-[820px]">' +
        '<div class="home-hero-kicker reveal-mask mb-8">' +
        '<div class="reveal-line text-xs sm:text-sm font-semibold text-amber-400 uppercase">' + T.hero.bannerKicker + '</div>' +
        '<span aria-hidden="true"></span>' +
        '</div>' +
        '<h1 class="home-hero-title font-display font-medium text-white leading-[0.92] text-5xl sm:text-6xl md:text-7xl lg:text-[6.75rem]">' +
        '<span class="block reveal-mask"><span class="reveal-line">' + T.hero.bannerTitle1 + '</span></span>' +
        '<span class="block reveal-mask"><span class="reveal-line">' + T.hero.bannerTitle2 + joiner + '<span class="text-gold-gradient">' + T.hero.bannerAccent + '</span></span></span>' +
        '</h1>' +
        '<p class="home-hero-copy max-w-2xl mt-8 text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed" data-reveal-up>' + T.hero.bannerDesc + '</p>' +
        '<div class="home-hero-actions flex flex-col sm:flex-row gap-4 mt-9" data-reveal-up>' +
        '<a href="/properties/index.html" class="home-hero-btn home-hero-btn-primary inline-flex items-center justify-between gap-8 px-8 h-14 text-base font-semibold transition-colors">' +
        '<span>' + T.hero.bannerPrimary + '</span><i data-lucide="arrow-right" class="w-5 h-5"></i></a>' +
        '<a href="/contact.html" class="home-hero-btn home-hero-btn-secondary inline-flex items-center justify-between gap-8 px-8 h-14 text-base font-semibold transition-colors">' +
        '<span>' + T.hero.bannerSecondary + '</span><i data-lucide="arrow-right" class="w-5 h-5"></i></a>' +
        '</div></div></div></section>';
}

/* Three co-equal businesses, editorial register: a 2px navy top-rule per
 * column, Cormorant title, gold tag. Solves "businesses buried in a dropdown". */
function threePillarsSection() {
    const T = ROOFY.tr();
    const items = T.services.items || [];
    const icons = ['building-2', 'tv', 'sparkles'];
    const cards = items.map(function (s, i) {
        return '<a href="/' + s.href + '" class="group block border-t-2 border-slate-900 pt-8" data-reveal-up>' +
            '<div class="flex items-center justify-between mb-6">' +
            '<i data-lucide="' + (icons[i] || 'square') + '" class="w-7 h-7 text-amber-600"></i>' +
            '<i data-lucide="arrow-up-right" class="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors"></i></div>' +
            '<h3 class="font-display text-2xl lg:text-3xl font-semibold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">' + s.title + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed mb-4">' + s.desc + '</p>' +
            '<span class="text-xs font-semibold tracking-[0.16em] text-amber-600 uppercase">' + s.tag + ' →</span>' +
            '</a>';
    }).join('');
    return '<section class="bg-slate-50 py-16 md:py-28 lg:py-40">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-16 lg:mb-24">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4" data-reveal-up>' + T.services.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight" data-reveal-up>' + T.services.title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">' + cards + '</div>' +
        '</div></section>';
}

/* Featured listings — Swiper carousel of real-photo property cards. */
function featuredPropertiesSection() {
    const T = ROOFY.tr();
    const list = (window.ROOFY_DATA.properties || []).slice(0, 9);
    let slides;
    if (list.length === 0) {
        slides = '<div class="swiper-slide"><div class="text-center py-16 text-slate-500 text-sm">Loading listings…</div></div>';
    } else {
        slides = list.map(function (p) { return '<div class="swiper-slide">' + window.propertyCard(p, T) + '</div>'; }).join('');
    }
    return '<section id="properties" class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 lg:mb-20">' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.featured.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900" data-reveal-up>' + T.featured.title + '</h2></div>' +
        '<div class="flex items-center gap-2 shrink-0" data-reveal-up>' +
        '<button type="button" class="featured-prev inline-flex items-center justify-center w-11 h-11 border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors" aria-label="Previous"><i data-lucide="arrow-left" class="w-4 h-4"></i></button>' +
        '<button type="button" class="featured-next inline-flex items-center justify-center w-11 h-11 border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors" aria-label="Next"><i data-lucide="arrow-right" class="w-4 h-4"></i></button>' +
        '</div></div>' +
        '<div class="featured-swiper swiper" data-reveal-up><div class="swiper-wrapper">' + slides + '</div></div>' +
        '<div class="mt-12 flex justify-center" data-reveal-up>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-8 h-12 transition-colors">' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></section>';
}

window.onRoofyRender = function () {
    if (typeof Swiper !== 'undefined') {
        if (window._featSwiper && window._featSwiper.destroy) {
            try { window._featSwiper.destroy(true, true); } catch (_) { }
            window._featSwiper = null;
        }
        var el = document.querySelector('.featured-swiper');
        if (el) {
            var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window._featSwiper = new Swiper(el, {
                slidesPerView: 1.15,
                spaceBetween: 20,
                grabCursor: true,
                loop: el.querySelectorAll('.swiper-slide').length > 3,
                breakpoints: { 640: { slidesPerView: 2, spaceBetween: 22 }, 1024: { slidesPerView: 3, spaceBetween: 24 } },
                autoplay: reduce ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
                pagination: { el: '.featured-pagination', clickable: true },
                navigation: { nextEl: '.featured-next', prevEl: '.featured-prev' }
            });
        }
    }
};

/* Group flagship projects (Crown / Miracle / Serenity). */
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
        return '<span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 ' + tone + '">' + label + '</span>';
    }

    const cards = projects.map(function (p) {
        const name = lang === 'zh' ? p.nameZh : p.nameEn;
        const tagline = lang === 'zh' ? p.taglineZh : p.taglineEn;
        const propertyType = lang === 'zh' ? p.propertyTypeZh : p.propertyTypeEn;
        return '<a href="/projects/' + encodeURIComponent(p.id) + '.html" ' +
            'class="group flex flex-col h-full" data-reveal-up>' +
            '<div class="img-zoom relative aspect-[5/4] overflow-hidden bg-slate-100 shrink-0">' +
            '<img src="' + p.heroImg + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + escapeAttr(name) + '" loading="lazy" class="w-full h-full object-cover" />' +
            '<div class="absolute top-4 left-4 flex flex-col items-start gap-1.5">' + statusBadge(p.status) +
            (p.placeholder ? '<span class="text-[10px] font-semibold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2.5 py-1">' + T.projects.sample + '</span>' : '') +
            '</div></div>' +
            '<div class="pt-5 flex flex-col flex-1">' +
            '<div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">' +
            '<i data-lucide="map-pin" class="w-3 h-3 shrink-0"></i>' + (p.location || '') + '</div>' +
            '<h3 class="font-display text-xl font-semibold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">' + name + '</h3>' +
            '<p class="text-sm text-slate-600 leading-snug mb-4 line-clamp-2 flex-1">' + (tagline || '') + '</p>' +
            '<div class="mt-auto">' +
            '<div class="text-amber-600 font-display font-semibold text-xl whitespace-nowrap">' + (p.priceRange || T.projects.priceOnRequest) + '</div>' +
            '</div></div></a>';
    }).join('');

    return '<section class="py-16 md:py-28 lg:py-40 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-14 lg:mb-20" data-reveal-up>' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + T.projects.sectionEyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900">' + T.projects.sectionTitle + '</h2>' +
        '</div></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">' + cards + '</div>' +
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
        '<h3 class="font-display text-2xl lg:text-3xl font-semibold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors max-w-xl">' + (lang === 'zh' ? a0.titleZh : a0.titleEn) + '</h3>' +
        '<p class="text-sm text-slate-600 leading-relaxed mt-3 max-w-xl">' + (lang === 'zh' ? (a0.excerptZh || '') : (a0.excerptEn || '')) + '</p>' +
        '</a>';
    const side = list.slice(1, 3).map(function (a, i) {
        return '<a href="/news/article.html?id=' + encodeURIComponent(a.id) + '" class="group flex gap-5 items-start' + (i > 0 ? ' border-t border-slate-200 pt-7' : '') + '" data-reveal-up>' +
            '<div class="img-zoom overflow-hidden w-32 sm:w-40 shrink-0"><img src="' + a.coverImg + '" alt="" loading="lazy" class="w-full aspect-[4/3] object-cover" /></div>' +
            '<div class="min-w-0">' +
            '<div class="flex items-center gap-2 text-xs mb-2 text-slate-500">' + meta(a) + '</div>' +
            '<h3 class="font-display text-lg font-semibold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">' + (lang === 'zh' ? a.titleZh : a.titleEn) + '</h3>' +
            '</div></a>';
    }).join('');
    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex items-end justify-between gap-6 mb-14 lg:mb-20">' +
        '<div>' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.homeNews.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900" data-reveal-up>' + T.homeNews.title + '</h2></div>' +
        '<a href="/news/index.html" class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors shrink-0" data-reveal-up>' +
        T.homeNews.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">' + lead +
        '<div class="lg:col-span-5 flex flex-col gap-7 lg:pt-2">' + side + '</div>' +
        '</div></div></section>';
}

function ctaBannerSection() {
    const T = ROOFY.tr();
    return '<section class="relative py-20 lg:py-28 bg-slate-900 text-white overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow inline-flex text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-8 h-12 transition-colors" data-reveal-up>' +
        T.cta.ctaBtn + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<div class="mt-10 pt-8 border-t border-white/15 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-300" data-reveal-up>' +
        '<span class="inline-flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-amber-400"></i>' + T.contact.addressV + '</span>' +
        '<a href="tel:+260964813736" class="inline-flex items-center gap-2 hover:text-white transition-colors"><i data-lucide="phone" class="w-4 h-4 text-amber-400"></i>' + T.contact.phoneV + '</a>' +
        '<a href="mailto:roofy@mingyangrt.com" class="inline-flex items-center gap-2 hover:text-white transition-colors"><i data-lucide="mail" class="w-4 h-4 text-amber-400"></i>' + T.contact.emailV + '</a>' +
        '</div>' +
        '</div></section>';
}

/* Full-bleed cinematic break — a single oversized line over an estate image,
 * giving the long scroll a filmic pause between the businesses and the listings. */
function cinematicBreak() {
    const lang = ROOFY.state.lang;
    const img = '/assets/img/projects/estate-gate.jpg';
    const line = lang === 'zh' ? '在卢萨卡的每一条街道，都有 ROOFY。' : 'On every street in Lusaka, you will find ROOFY.';
    return '<section class="hero-cinematic relative min-h-[72vh] min-h-[72dvh] flex items-end" style="background-image:url(\'' + img + '\')">' +
        '<div class="relative w-full max-w-[1280px] mx-auto px-6 lg:px-10 pb-16 lg:pb-24">' +
        '<h2 class="font-display font-medium text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl max-w-3xl leading-[1.05]" data-reveal-up>' + line + '</h2>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        heroSection() +
        threePillarsSection() +
        cinematicBreak() +
        featuredPropertiesSection() +
        projectsBandSection() +
        newsSection() +
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
