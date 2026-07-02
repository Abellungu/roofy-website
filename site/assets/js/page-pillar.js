/* Shared renderer for the three pillar pages (real-estate / advertising / branding).
 * Driven by window.ROOFY_PAGE.id; all variation is data, not structure.
 * slate + amber register (matches 模板1). The advertising pillar additionally
 * renders the LED sales/rental product table + LED billboard inventory table.
 */
window.ROOFY_DATA = window.ROOFY_DATA || {};

/* kebab-case id → camelCase i18n key */
const PILLAR_I18N_KEY = { 'real-estate': 'realEstate', advertising: 'advertising', branding: 'branding' };

function currentPillarData() {
    const id = (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'real-estate';
    const list = (window.ROOFY_DATA.services && window.ROOFY_DATA.services.pillars) || [];
    return list.find(function (p) { return p.id === id; }) || null;
}

function adjacentPillars() {
    const id = (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'real-estate';
    const list = (window.ROOFY_DATA.services && window.ROOFY_DATA.services.pillars) || [];
    return list.filter(function (p) { return p.id !== id; });
}

function pillarHero() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const p = currentPillarData();
    if (!p) return '';
    const ti18n = T.pillars[PILLAR_I18N_KEY[p.id]] || {};
    const title = ti18n.title || (lang === 'zh' ? p.titleZh : p.title);
    const summary = ti18n.summary || (lang === 'zh' ? p.summaryZh : p.summary);
    /* Unified cinematic hero across all three pillars (the design-reference
     * look): full-bleed image, oversized Cormorant title bottom-left, minimal.
     * Each pillar keeps its own photo. */
    const heroImg = {
        'real-estate': '/assets/img/projects/oasis-crown-render.jpg',
        advertising: '/assets/img/led/advertising-hero.jpg',
        branding: '/assets/img/office/office-terrace.jpg'
    }[p.id] || p.heroImg;
    return '<section id="top" class="hero-cinematic relative min-h-[80vh] flex" style="background-image:url(\'' + heroImg + '\')" data-hero-reveal>' +
        '<div class="relative w-full max-w-[1280px] mx-auto px-6 lg:px-10 flex items-end pt-32 pb-16 lg:pb-20">' +
        '<div class="max-w-3xl">' +
        '<div class="reveal-mask mb-6"><div class="reveal-line text-xs font-semibold tracking-[0.25em] text-amber-400 uppercase">' + ti18n.eyebrow + '</div></div>' +
        '<h1 class="font-display font-medium text-white leading-[0.95] mb-8 text-5xl sm:text-6xl lg:text-7xl">' +
        '<span class="block reveal-mask"><span class="reveal-line">' + title + '</span></span></h1>' +
        '<div class="flex flex-wrap items-center gap-3" data-reveal-up>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 transition-colors">' + ti18n.inquire + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<a href="#adjacent" class="inline-flex items-center gap-2 border border-white/40 hover:border-amber-400 hover:text-amber-400 text-white text-sm font-medium px-7 h-12 transition-colors">' + T.pillars.adjacent + '</a>' +
        '</div></div></div></section>';
}

function pillarNarrative() {
    const lang = ROOFY.state.lang;
    const p = currentPillarData();
    if (!p) return '';
    const paras = (lang === 'zh' ? p.narrativeZh : p.narrative) || [];
    if (!paras.length) return '';
    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">' +
        paras.map(function (para, i) {
            return '<p class="font-display text-2xl lg:text-3xl leading-snug ' + (i === 0 ? 'text-slate-900' : 'text-slate-400') + '" data-reveal-up>' + para + '</p>';
        }).join('') +
        '</div></section>';
}

function pillarDeliverables() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const p = currentPillarData();
    if (!p) return '';
    const names = (lang === 'zh' ? p.deliverablesZh : p.deliverables) || [];
    const descs = (lang === 'zh' ? p.deliverableDescZh : p.deliverableDescEn) || [];
    if (!names.length) return '';
    /* Editorial treatment: rule-on-top list items instead of floating cards. */
    const rows = names.map(function (n, i) {
        return '<div data-reveal-up class="group grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-3 items-baseline border-t border-slate-300 py-8 lg:py-12">' +
            '<div class="lg:col-span-1 text-sm font-semibold text-amber-600 tracking-widest">' + String(i + 1).padStart(2, '0') + '</div>' +
            '<h3 class="lg:col-span-6 font-display text-3xl lg:text-5xl font-medium text-slate-900 leading-[1.05]">' + n + '</h3>' +
            '<p class="lg:col-span-5 text-sm lg:text-base text-slate-500 leading-relaxed lg:pt-2">' + (descs[i] || '') + '</p>' +
            '</div>';
    }).join('');
    return '<section class="py-16 md:py-28 lg:py-40 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-12 lg:mb-16" data-reveal-up>' + T.pillars.deliverablesTitle + '</div>' +
        '<div class="border-b border-slate-300">' + rows + '</div>' +
        '</div></section>';
}

function pillarSpotlight() {
    const T = ROOFY.tr();
    const id = (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'real-estate';
    if (id === 'real-estate') return spotlightRealEstate(T);
    if (id === 'advertising') return spotlightAdvertising(T);
    if (id === 'branding') return spotlightBranding(T);
    return '';
}

function spotlightRealEstate(T) {
    const all = (window.ROOFY_DATA.properties || []);
    const list = all.slice(0, 3);
    const cards = list.length === 0
        ? '<div class="col-span-full text-center py-12 text-slate-500 text-sm">Loading…</div>'
        : list.map(function (p) { return window.propertyCard(p, T); }).join('');
    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.featured.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + T.featured.title + '</h2></div>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '<div class="mt-12 flex justify-center" data-reveal-up>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-8 h-12 transition-colors">' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '</div></section>';
}

function spotlightBranding(T) {
    const steps = T.pillars.approach || [];
    const ti18n = T.pillars.branding;
    const items = steps.map(function (s) {
        return '<div data-reveal-up>' +
            '<div class="text-3xl font-semibold text-amber-500 mb-3">' + s.n.split(' ')[0] + '</div>' +
            '<h3 class="text-lg font-semibold text-slate-900 mb-2">' + s.t + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + s.d + '</p></div>';
    }).join('');
    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti18n.approachTitle + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + ti18n.approachDesc + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">' + items + '</div>' +
        '</div></section>';
}

/* ── Advertising spotlight = capabilities + LED products + LED billboards + emerging callout ── */

function spotlightAdvertising(T) {
    return capabilitiesBlock(T) + ledProductsBlock(T) + ledBillboardsBlock(T) + emergingCallout(T);
}

function capabilitiesBlock(T) {
    const caps = T.pillars.capabilities || [];
    const ti18n = T.pillars.advertising;
    const capTiles = caps.map(function (c, i) {
        return '<div data-reveal-up class="group grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-2 items-baseline border-t border-slate-300 py-8 lg:py-11">' +
            '<div class="lg:col-span-1 text-sm font-semibold text-amber-600 tracking-widest">' + String(i + 1).padStart(2, '0') + '</div>' +
            '<h3 class="lg:col-span-5 font-display text-2xl lg:text-3xl font-medium text-slate-900 leading-tight">' + c.t + '</h3>' +
            '<p class="lg:col-span-6 text-sm lg:text-base text-slate-500 leading-relaxed lg:pt-1.5">' + c.d + '</p>' +
            '</div>';
    }).join('');
    return '<section class="py-16 md:py-28 lg:py-40 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12 lg:mb-16">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti18n.capabilitiesTitle + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + ti18n.capabilitiesDesc + '</h2></div>' +
        '<div class="border-b border-slate-300">' + capTiles + '</div>' +
        '</div></section>';
}

function ledProductsBlock(T) {
    const ti = T.ledProducts;
    if (!ti) return '';
    const lang = ROOFY.state.lang;
    const products = window.ROOFY_DATA.ledProducts || [];
    if (!products.length) return '';

    function specRow(label, val) {
        if (!val) return '';
        return '<div class="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-b-0">' +
            '<span class="text-slate-400">' + label + '</span>' +
            '<span class="text-slate-700 font-medium text-right">' + val + '</span></div>';
    }

    /* Image-forward product cards (real Absen catalogue) */
    const cards = products.map(function (p) {
        const name = lang === 'zh' ? p.nameZh : p.nameEn;
        const note = lang === 'zh' ? p.noteZh : p.noteEn;
        const usage = ti.usageLabels[p.usage] || p.usage;
        const mode = (ti.modeLabels && ti.modeLabels[p.mode]) || '';
        return '<div data-reveal-up class="group flex flex-col">' +
            '<div class="relative aspect-[16/10] bg-slate-100 flex items-center justify-center overflow-hidden">' +
            '<img src="' + p.img + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + p.model + ' ' + name + '" loading="lazy" class="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-105" />' +
            (p.series ? '<span class="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-slate-900/85 backdrop-blur text-white px-2 py-0.5 rounded-sm">' + p.series + '</span>' : '') +
            '<span class="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-amber-500 text-slate-900 px-2 py-0.5 rounded-sm">' + usage + '</span>' +
            '</div>' +
            '<div class="flex flex-col flex-1 pt-5">' +
            '<div class="flex items-baseline justify-between gap-3 mb-1">' +
            '<div class="text-lg font-semibold text-slate-900">' + p.model + '</div>' +
            (mode ? '<span class="text-[11px] font-semibold text-amber-600 whitespace-nowrap">' + mode + '</span>' : '') +
            '</div>' +
            '<div class="text-sm text-slate-500 mb-4">' + name + '</div>' +
            '<div class="text-xs mb-4">' +
            specRow(ti.cols.pitch, p.pixelPitch) +
            specRow(ti.cols.brightness, p.brightness) +
            specRow(ti.cols.cabinet, p.cabinetSize) +
            ((p.ip || p.refresh || p.install || p.cert) ?
                '<details class="led-specs">' +
                '<summary class="flex items-center justify-between py-1.5 cursor-pointer text-slate-500 hover:text-amber-600 transition-colors">' +
                '<span>' + ti.moreSpecs + '</span><i data-lucide="chevron-down" class="led-chev w-3.5 h-3.5 shrink-0 transition-transform"></i></summary>' +
                specRow(ti.cols.ip, p.ip) +
                specRow(ti.cols.refresh, p.refresh) +
                specRow(ti.cols.install, p.install) +
                specRow(ti.cols.cert, p.cert) +
                '</details>' : '') +
            '</div>' +
            (note ? '<p class="text-xs text-slate-500 leading-relaxed mb-4">' + note + '</p>' : '') +
            '<div class="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">' +
            '<div><div class="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">' + ti.cols.sale + '</div>' +
            '<div class="text-sm font-semibold ' + (p.salePrice ? 'text-amber-600' : 'text-slate-400') + '">' + (p.salePrice || ti.onRequest) + '</div></div>' +
            '<div><div class="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">' + ti.cols.rental + '</div>' +
            '<div class="text-sm font-semibold ' + (p.rentalPrice ? 'text-amber-600' : 'text-slate-400') + '">' + (p.rentalPrice || ti.onRequest) + '</div></div>' +
            '</div></div></div>';
    }).join('');

    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-semibold text-slate-900" data-reveal-up>' + ti.title + '</h2></div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' + cards + '</div>' +
        '<div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-10" data-reveal-up>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-sm transition-colors">' +
        ti.inquire + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<p class="text-xs text-slate-500">' + ti.note + '</p>' +
        '</div></div></section>';
}

function ledBillboardsBlock(T) {
    const ti = T.ledBillboards;
    if (!ti) return '';
    const lang = ROOFY.state.lang;
    const boards = window.ROOFY_DATA.ledBillboards || [];
    if (!boards.length) return '';

    function availBadge(a) {
        const label = ti.availabilityLabels[a] || a;
        const tone = {
            booking: 'bg-amber-500 text-slate-900',
            coming: 'bg-slate-200 text-slate-700',
            booked: 'bg-slate-700 text-white'
        }[a] || 'bg-slate-200 text-slate-700';
        return '<span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ' + tone + '">' + label + '</span>';
    }

    const cards = boards.map(function (b) {
        const name = lang === 'zh' ? b.nameZh : b.nameEn;
        const addr = lang === 'zh' ? b.addressZh : b.addressEn;
        return '<div data-reveal-up class="group">' +
            '<div class="img-zoom relative aspect-[16/10] overflow-hidden bg-slate-100">' +
            '<img src="' + b.img + '" data-placeholder="' + (b.placeholder ? 'true' : 'false') + '" alt="' + name + '" loading="lazy" class="w-full h-full object-cover" />' +
            '<div class="absolute top-3 left-3 flex items-center gap-2">' +
            '<span class="text-[10px] font-semibold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded-sm">' + b.code + '</span>' +
            availBadge(b.availability) + '</div></div>' +
            '<div class="pt-5">' +
            '<h3 class="text-base font-semibold text-slate-900 mb-1">' + name + '</h3>' +
            (addr ? '<div class="flex items-start gap-1.5 text-xs text-slate-500 mb-4"><i data-lucide="map-pin" class="w-3 h-3 mt-0.5 shrink-0"></i><span>' + addr + '</span></div>' : '') +
            '<div class="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-slate-100 text-xs">' +
            '<div><span class="text-slate-400">' + ti.cols.size + '</span><div class="text-slate-800 font-semibold">' + (b.screenSize || '—') + '</div></div>' +
            '<div><span class="text-slate-400">' + ti.cols.traffic + '</span><div class="text-slate-800 font-semibold">' + (b.dailyTraffic || '—') + '</div></div>' +
            '<div class="col-span-2"><span class="text-slate-400">' + ti.cols.rate + '</span><div class="font-semibold ' + (b.monthlyRate ? 'text-amber-600' : 'text-slate-400') + '">' + (b.monthlyRate || ti.onRequest) + '</div></div>' +
            '</div></div></div>';
    }).join('');

    return '<section class="py-16 md:py-28 lg:py-40 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-semibold text-slate-900" data-reveal-up>' + ti.title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">' + cards + '</div>' +
        '<div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-8" data-reveal-up>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-sm transition-colors">' +
        ti.inquire + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<p class="text-xs text-slate-500">' + ti.note + '</p>' +
        '</div></div></section>';
}

function emergingCallout(T) {
    const ti18n = T.pillars.advertising;
    if (!ti18n || !ti18n.empty) return '';
    return '<section class="py-16 lg:py-20 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="relative bg-slate-900 text-white p-10 lg:p-14 overflow-hidden" data-reveal-up>' +
        '<div class="relative max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">' + ti18n.empty.badge + '</div>' +
        '<h3 class="text-2xl md:text-3xl font-semibold text-white mb-4 leading-tight">' + ti18n.empty.title + '</h3>' +
        '<p class="text-slate-300 leading-relaxed mb-8">' + ti18n.empty.desc + '</p>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 transition-colors">' +
        ti18n.empty.cta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></div></section>';
}

function pillarCta() {
    const T = ROOFY.tr();
    return '<section class="relative py-16 md:py-28 lg:py-40 bg-slate-900 text-white overflow-hidden">' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-semibold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.pillars.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 transition-colors" data-reveal-up>' +
        T.pillars.ctaBtn + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

function pillarAdjacent() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const others = adjacentPillars();
    if (others.length === 0) return '';
    const cards = others.map(function (p) {
        const title = lang === 'zh' ? p.titleZh : p.title;
        const summary = lang === 'zh' ? p.summaryZh : p.summary;
        return '<a href="/services/' + p.id + '.html" class="group block border-t border-slate-300 pt-8" data-reveal-up>' +
            '<h3 class="font-display text-3xl lg:text-4xl font-medium text-slate-900 mb-3 group-hover:text-amber-700 transition-colors leading-tight">' + title + '</h3>' +
            '<p class="text-sm lg:text-base text-slate-500 leading-relaxed mb-6 max-w-md">' + summary + '</p>' +
            '<span class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">' +
            (lang === 'zh' ? '继续了解' : 'Keep exploring') + ' <i data-lucide="arrow-right" class="w-4 h-4"></i></span>' +
            '</a>';
    }).join('');
    return '<section id="adjacent" class="py-16 md:py-28 lg:py-40 bg-slate-50 border-t border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.pillars.adjacent + '</div>' +
        '<h2 class="font-display text-3xl md:text-4xl font-semibold text-slate-900 mb-12 lg:mb-16 max-w-3xl" data-reveal-up>' + (lang === 'zh' ? '另外两条业务线，可能也对您有用。' : 'Two adjacent practices you may also find useful.') + '</h2>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">' + cards + '</div>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        pillarHero() +
        pillarNarrative() +
        pillarDeliverables() +
        pillarSpotlight() +
        pillarCta() +
        pillarAdjacent() +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadPillarData() {
    const id = (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'real-estate';
    const jobs = [
        fetch('/assets/data/services.json').then(function (r) { return r.json(); }).then(function (d) { window.ROOFY_DATA.services = d; }).catch(function () { })
    ];
    if (id === 'real-estate') {
        jobs.push(fetch('/assets/data/properties.json').then(function (r) { return r.json(); }).then(function (d) { window.ROOFY_DATA.properties = (d && d.items) || []; }).catch(function () { }));
    }
    if (id === 'advertising') {
        jobs.push(fetch('/assets/data/led-products.json').then(function (r) { return r.json(); }).then(function (d) { window.ROOFY_DATA.ledProducts = (d && d.products) || []; }).catch(function () { }));
        jobs.push(fetch('/assets/data/led-billboards.json').then(function (r) { return r.json(); }).then(function (d) { window.ROOFY_DATA.ledBillboards = (d && d.billboards) || []; }).catch(function () { }));
    }
    return Promise.all(jobs);
}

window.addEventListener('DOMContentLoaded', function () {
    loadPillarData().then(function () { ROOFY.boot({ page: (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'real-estate' }); });
});
