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
    return '<section id="top" class="relative bg-slate-900 pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute inset-0">' +
        '<img src="' + p.heroImg + '" data-placeholder="true" class="w-full h-full object-cover opacity-30" alt="" />' +
        '<div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-slate-900/60"></div>' +
        '</div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wider uppercase">' + ti18n.eyebrow + '</span></span>' +
        '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 max-w-4xl"><span class="block reveal-mask"><span class="reveal-line">' + title + '</span></span></h1>' +
        '<div class="reveal-mask max-w-2xl mb-8"><p class="reveal-line text-base lg:text-lg text-slate-300 leading-relaxed">' + summary + '</p></div>' +
        '<div class="reveal-mask"><div class="reveal-line flex flex-wrap items-center gap-3">' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors shadow-lg shadow-amber-500/20">' +
        ti18n.inquire + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<a href="#adjacent" class="inline-flex items-center gap-2 border border-slate-600 hover:border-amber-500 hover:text-amber-400 text-white text-sm font-medium px-6 h-11 rounded-md transition-colors">' +
        T.pillars.adjacent + '</a>' +
        '</div></div></div></section>';
}

function pillarNarrative() {
    const lang = ROOFY.state.lang;
    const p = currentPillarData();
    if (!p) return '';
    const paras = (lang === 'zh' ? p.narrativeZh : p.narrative) || [];
    if (!paras.length) return '';
    return '<section class="py-16 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">' +
        paras.map(function (para, i) {
            return '<p class="text-base lg:text-lg leading-relaxed ' + (i === 0 ? 'text-slate-800' : 'text-slate-500') + '" data-reveal-up>' + para + '</p>';
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
    const tiles = names.map(function (n, i) {
        return '<div data-reveal-up class="p-7 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow">' +
            '<div class="text-xs text-amber-600 font-semibold mb-3">' + String(i + 1).padStart(2, '0') + '</div>' +
            '<h3 class="text-base font-bold text-slate-900 mb-2">' + n + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + (descs[i] || '') + '</p>' +
            '</div>';
    }).join('');
    return '<section class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.pillars.deliverablesTitle + '</div>' +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">' + tiles + '</div>' +
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
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">' +
        '<div class="max-w-2xl">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.featured.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.featured.title + '</h2></div>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        T.featured.viewAll + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">' + cards + '</div>' +
        '</div></section>';
}

function spotlightBranding(T) {
    const steps = T.pillars.approach || [];
    const ti18n = T.pillars.branding;
    const items = steps.map(function (s) {
        return '<div data-reveal-up>' +
            '<div class="text-3xl font-bold text-amber-500 mb-3">' + s.n.split(' ')[0] + '</div>' +
            '<h3 class="text-lg font-bold text-slate-900 mb-2">' + s.t + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + s.d + '</p></div>';
    }).join('');
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti18n.approachTitle + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + ti18n.approachDesc + '</h2></div>' +
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
        return '<div data-reveal-up class="group p-6 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow">' +
            '<div class="w-11 h-11 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">' +
            '<i data-lucide="' + c.icon + '" class="w-5 h-5"></i></div>' +
            '<h3 class="text-base font-bold text-slate-900 mb-1.5">' + c.t + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + c.d + '</p>' +
            '</div>';
    }).join('');
    return '<section class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti18n.capabilitiesTitle + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900" data-reveal-up>' + ti18n.capabilitiesDesc + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">' + capTiles + '</div>' +
        '</div></section>';
}

function ledProductsBlock(T) {
    const ti = T.ledProducts;
    if (!ti) return '';
    const lang = ROOFY.state.lang;
    const products = window.ROOFY_DATA.ledProducts || [];
    if (!products.length) return '';

    /* Desktop table rows */
    const rows = products.map(function (p) {
        const name = lang === 'zh' ? p.nameZh : p.nameEn;
        const usage = ti.usageLabels[p.usage] || p.usage;
        const note = lang === 'zh' ? p.noteZh : p.noteEn;
        return '<tr class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">' +
            '<td class="py-4 px-4">' +
            '<div class="font-semibold text-slate-900">' + p.model + '</div>' +
            '<div class="text-xs text-slate-500">' + name + '</div>' +
            (note ? '<div class="text-xs text-slate-400 mt-0.5">' + note + '</div>' : '') +
            '</td>' +
            '<td class="py-4 px-4"><span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">' + usage + '</span></td>' +
            '<td class="py-4 px-4 text-sm text-slate-700">' + (p.pixelPitch || '—') + '</td>' +
            '<td class="py-4 px-4 text-sm text-slate-700">' + (p.brightness || '—') + '</td>' +
            '<td class="py-4 px-4 text-sm text-slate-700">' + (p.cabinetSize || '—') + '</td>' +
            '<td class="py-4 px-4 text-sm font-semibold ' + (p.salePrice ? 'text-amber-600' : 'text-slate-400') + '">' + (p.salePrice || ti.onRequest) + '</td>' +
            '<td class="py-4 px-4 text-sm font-semibold ' + (p.rentalPrice ? 'text-amber-600' : 'text-slate-400') + '">' + (p.rentalPrice || ti.onRequest) + '</td>' +
            '</tr>';
    }).join('');

    /* Mobile cards (table is hidden < lg) */
    const cards = products.map(function (p) {
        const name = lang === 'zh' ? p.nameZh : p.nameEn;
        const usage = ti.usageLabels[p.usage] || p.usage;
        return '<div class="p-5 bg-white border border-slate-100 rounded-xl shadow-sm">' +
            '<div class="flex items-center justify-between mb-3">' +
            '<div><div class="font-bold text-slate-900">' + p.model + '</div><div class="text-xs text-slate-500">' + name + '</div></div>' +
            '<span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">' + usage + '</span></div>' +
            '<div class="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">' +
            '<div><span class="text-slate-400">' + ti.cols.pitch + '</span><div class="text-slate-700 font-medium">' + (p.pixelPitch || '—') + '</div></div>' +
            '<div><span class="text-slate-400">' + ti.cols.brightness + '</span><div class="text-slate-700 font-medium">' + (p.brightness || '—') + '</div></div>' +
            '<div><span class="text-slate-400">' + ti.cols.sale + '</span><div class="font-semibold ' + (p.salePrice ? 'text-amber-600' : 'text-slate-400') + '">' + (p.salePrice || ti.onRequest) + '</div></div>' +
            '<div><span class="text-slate-400">' + ti.cols.rental + '</span><div class="font-semibold ' + (p.rentalPrice ? 'text-amber-600' : 'text-slate-400') + '">' + (p.rentalPrice || ti.onRequest) + '</div></div>' +
            '</div></div>';
    }).join('');

    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-8">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-reveal-up>' + ti.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed" data-reveal-up>' + ti.desc + '</p></div>' +
        /* desktop table */
        '<div class="hidden lg:block overflow-hidden rounded-xl border border-slate-200 shadow-sm" data-reveal-up>' +
        '<table class="w-full text-left">' +
        '<thead class="bg-slate-900 text-white text-xs uppercase tracking-wider">' +
        '<tr>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.product + '</th>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.usage + '</th>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.pitch + '</th>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.brightness + '</th>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.cabinet + '</th>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.sale + '</th>' +
        '<th class="py-3 px-4 font-semibold">' + ti.cols.rental + '</th>' +
        '</tr></thead>' +
        '<tbody class="bg-white">' + rows + '</tbody></table></div>' +
        /* mobile cards */
        '<div class="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4" data-reveal-up>' + cards + '</div>' +
        '<div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-8" data-reveal-up>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors">' +
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
        return '<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ' + tone + '">' + label + '</span>';
    }

    const cards = boards.map(function (b) {
        const name = lang === 'zh' ? b.nameZh : b.nameEn;
        const addr = lang === 'zh' ? b.addressZh : b.addressEn;
        return '<div data-reveal-up class="group bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">' +
            '<div class="img-zoom relative aspect-[16/10] overflow-hidden bg-slate-100">' +
            '<img src="' + b.img + '" data-placeholder="' + (b.placeholder ? 'true' : 'false') + '" alt="' + name + '" loading="lazy" class="w-full h-full object-cover" />' +
            '<div class="absolute top-3 left-3 flex items-center gap-2">' +
            '<span class="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded-md">' + b.code + '</span>' +
            availBadge(b.availability) + '</div></div>' +
            '<div class="p-5">' +
            '<h3 class="text-base font-bold text-slate-900 mb-1">' + name + '</h3>' +
            (addr ? '<div class="flex items-start gap-1.5 text-xs text-slate-500 mb-4"><i data-lucide="map-pin" class="w-3 h-3 mt-0.5 shrink-0"></i><span>' + addr + '</span></div>' : '') +
            '<div class="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-slate-100 text-xs">' +
            '<div><span class="text-slate-400">' + ti.cols.size + '</span><div class="text-slate-800 font-semibold">' + (b.screenSize || '—') + '</div></div>' +
            '<div><span class="text-slate-400">' + ti.cols.traffic + '</span><div class="text-slate-800 font-semibold">' + (b.dailyTraffic || '—') + '</div></div>' +
            '<div class="col-span-2"><span class="text-slate-400">' + ti.cols.rate + '</span><div class="font-semibold ' + (b.monthlyRate ? 'text-amber-600' : 'text-slate-400') + '">' + (b.monthlyRate || ti.onRequest) + '</div></div>' +
            '</div></div></div>';
    }).join('');

    return '<section class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + ti.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-reveal-up>' + ti.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed" data-reveal-up>' + ti.desc + '</p></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">' + cards + '</div>' +
        '<div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-8" data-reveal-up>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors">' +
        ti.inquire + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '<p class="text-xs text-slate-500">' + ti.note + '</p>' +
        '</div></div></section>';
}

function emergingCallout(T) {
    const ti18n = T.pillars.advertising;
    if (!ti18n || !ti18n.empty) return '';
    return '<section class="py-16 lg:py-20 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="relative rounded-2xl bg-slate-900 text-white p-10 lg:p-14 overflow-hidden" data-reveal-up>' +
        '<div class="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-2xl">' +
        '<div class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">' + ti18n.empty.badge + '</div>' +
        '<h3 class="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">' + ti18n.empty.title + '</h3>' +
        '<p class="text-slate-300 leading-relaxed mb-8">' + ti18n.empty.desc + '</p>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors">' +
        ti18n.empty.cta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></div></div></section>';
}

function pillarCta() {
    const T = ROOFY.tr();
    return '<section class="relative py-20 lg:py-28 bg-slate-900 text-white overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.pillars.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 rounded-md transition-colors shadow-lg shadow-amber-500/20" data-reveal-up>' +
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
        return '<a href="/services/' + p.id + '.html" class="group block p-8 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow" data-reveal-up>' +
            '<div class="w-11 h-11 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-white transition-colors">' +
            '<i data-lucide="' + p.icon + '" class="w-5 h-5"></i></div>' +
            '<h3 class="text-lg font-bold text-slate-900 mb-2">' + title + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed mb-5">' + summary + '</p>' +
            '<span class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">' +
            (lang === 'zh' ? '继续了解' : 'Keep exploring') + ' <i data-lucide="arrow-right" class="w-4 h-4"></i></span>' +
            '</a>';
    }).join('');
    return '<section id="adjacent" class="py-20 lg:py-28 bg-slate-50 border-t border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.pillars.adjacent + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-10 max-w-3xl" data-reveal-up>' + (lang === 'zh' ? '另外两条业务线，可能也对您有用。' : 'Two adjacent practices you may also find useful.') + '</h2>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">' + cards + '</div>' +
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
