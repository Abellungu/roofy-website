/* Properties listing — 搜房网-style rigorous layout (2026-05):
 *   - breadcrumb (首页 > 房源 > active facets) + result count
 *   - multi-row faceted filter bar (交易 / 类型 / 区域 / 房型) + keyword search
 *   - list-row view (horizontal rows, image left, info middle, price right)
 * Price stays brand-amber (no red). State on ROOFY.state.{propertyFilter,
 * propertyRegion, propertyTransaction, propertyBeds, propertySearch};
 * deep-links ?type=&region=&txn=&beds=&q=.
 * Page sections: dark hero → featured group projects band → breadcrumb +
 *   facet bar → list rows → CTA banner.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { properties: [], projects: [] };
window.ROOFY_PAGE = { id: 'properties', whatsapp: 'properties' };

function escapeAttr(s) {
    return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bedsMatches(beds, bucket) {
    if (bucket === 'all') return true;
    beds = beds || 0;
    if (bucket === '1') return beds >= 1 && beds <= 2;
    if (bucket === '3') return beds === 3;
    if (bucket === '4') return beds === 4;
    if (bucket === '5') return beds >= 5;
    return true;
}

function applyFilters(all) {
    const f = ROOFY.state;
    const search = (f.propertySearch || '').toLowerCase().trim();
    return all.filter(function (p) {
        if (f.propertyFilter !== 'all' && p.type !== f.propertyFilter) return false;
        if (f.propertyRegion !== 'all' && p.region !== f.propertyRegion) return false;
        if (f.propertyTransaction !== 'all' && (p.transactionType || 'sale') !== f.propertyTransaction) return false;
        if (f.propertyBeds !== 'all' && !bedsMatches(p.beds, f.propertyBeds)) return false;
        if (search) {
            const hay = [
                p.titleZh, p.titleEn, p.loc, p.descZh, p.descEn, p.area,
                p.beds ? p.beds + ' bed' : '', p.baths ? p.baths + ' bath' : ''
            ].filter(Boolean).join(' ').toLowerCase();
            if (hay.indexOf(search) < 0) return false;
        }
        return true;
    });
}

/* Price ordering across a mixed inventory (K sale / US$ sale / US$ month /
 * K night). The FX rate is an internal approximation used ONLY to make the
 * sort sensible — it is never displayed. Per-night rents are compared at a
 * 30-night month; "Price on request" always sinks to the end. */
const SORT_FX_ZMW_PER_USD = 27;
function priceSortValue(p) {
    const s = String(p.price || '');
    const m = s.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    if (!m) return null;
    let v = parseFloat(m[1]);
    if (/US\$|USD|\$/i.test(s)) v *= SORT_FX_ZMW_PER_USD;
    if (/night|晚/i.test(s)) v *= 30;
    return v;
}
function applySort(list) {
    const sort = ROOFY.state.propertySort || 'default';
    if (sort !== 'asc' && sort !== 'desc') return list;
    return list.slice().sort(function (a, b) {
        const va = priceSortValue(a), vb = priceSortValue(b);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        return sort === 'asc' ? va - vb : vb - va;
    });
}

function propertiesHero() {
    const T = ROOFY.tr();
    const heroImg = '/assets/img/projects/estate-gate.jpg';
    return '<section id="top" class="hero-cinematic relative min-h-[66vh] flex" style="background-image:url(\'' + heroImg + '\')" data-hero-reveal>' +
        '<div class="relative w-full max-w-[1280px] mx-auto px-6 lg:px-10 flex items-end pt-32 pb-14 lg:pb-20">' +
        '<div class="max-w-3xl">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line text-xs font-semibold tracking-[0.25em] text-amber-400 uppercase">' + T.properties.eyebrow + '</span></span>' +
        '<h1 class="font-display font-medium text-white leading-[0.95] text-5xl sm:text-6xl lg:text-7xl"><span class="block reveal-mask"><span class="reveal-line">' + T.properties.title + '</span></span></h1>' +
        '</div></div></section>';
}

function featuredProjectsBand() {
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
        return '<span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm ' + tone + '">' + label + '</span>';
    }

    const cards = projects.map(function (p) {
        const name = lang === 'zh' ? p.nameZh : p.nameEn;
        const tagline = lang === 'zh' ? p.taglineZh : p.taglineEn;
        const propertyType = lang === 'zh' ? p.propertyTypeZh : p.propertyTypeEn;
        return '<a href="/projects/' + encodeURIComponent(p.id) + '.html" ' +
            'class="group flex flex-col h-full" data-reveal-up>' +
            '<div class="img-zoom relative aspect-[5/4] overflow-hidden bg-slate-100 shrink-0">' +
            '<img src="' + p.heroImg + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + escapeAttr(name) + '" loading="lazy" decoding="async" class="w-full h-full object-cover" />' +
            '<div class="absolute top-4 left-4 flex flex-col items-start gap-1.5">' + statusBadge(p.status) +
            (p.placeholder ? '<span class="text-[10px] font-semibold uppercase tracking-wider bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-sm">' + T.projects.sample + '</span>' : '') +
            '</div></div>' +
            '<div class="pt-5 flex flex-col flex-1">' +
            '<div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">' +
            '<i data-lucide="map-pin" class="w-3 h-3 shrink-0"></i>' + (p.location || '') + '</div>' +
            '<h3 class="font-display text-lg font-semibold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">' + name + '</h3>' +
            '<p class="text-sm text-slate-600 leading-snug mb-4 line-clamp-2 flex-1">' + (tagline || '') + '</p>' +
            '<div class="pt-4 border-t border-slate-200 mt-auto">' +
            '<div class="text-amber-600 font-display font-semibold text-xl whitespace-nowrap">' + (p.priceRange || T.projects.priceOnRequest) + '</div>' +
            '</div></div></a>';
    }).join('');

    return '<section class="py-12 lg:py-16 bg-slate-50 border-b border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8" data-reveal-up>' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + T.projects.sectionEyebrow + '</div>' +
        '<h2 class="font-display text-2xl md:text-3xl font-semibold text-slate-900">' + T.projects.sectionTitle + '</h2>' +
        '</div></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">' + cards + '</div>' +
        '</div></section>';
}

/* One faceted filter row: label + inline clickable options. */
function facetRow(label, options, activeValue, handler) {
    const opts = options.map(function (o) {
        const active = activeValue === o.value;
        return '<button onclick="' + handler + '(\'' + o.value + '\')" class="text-sm px-3 h-8 rounded-sm transition-colors ' +
            (active ? 'bg-amber-500 text-slate-900 font-semibold' : 'text-slate-600 hover:text-amber-600 font-medium') + '">' + o.label + '</button>';
    }).join('');
    return '<div class="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 py-3 border-b border-slate-100 last:border-b-0">' +
        '<div class="text-sm font-semibold text-slate-400 shrink-0 sm:w-20 pt-1">' + label + '</div>' +
        '<div class="flex flex-wrap items-center gap-1">' + opts + '</div>' +
        '</div>';
}

function breadcrumbBar() {
    const T = ROOFY.tr();
    const crumbs = ['<a href="/" class="hover:text-amber-600 transition-colors">' + T.properties.breadcrumb.home + '</a>'];
    crumbs.push('<span class="text-slate-300">/</span>');
    crumbs.push('<span class="text-slate-700 font-medium">' + T.properties.breadcrumb.properties + '</span>');

    /* Append active facet labels */
    const active = [];
    if (ROOFY.state.propertyTransaction !== 'all') active.push(T.properties.transaction[ROOFY.state.propertyTransaction]);
    if (ROOFY.state.propertyFilter !== 'all') active.push(T.featured.filters[ROOFY.state.propertyFilter]);
    if (ROOFY.state.propertyRegion !== 'all' && T.properties.regions[ROOFY.state.propertyRegion]) active.push(T.properties.regions[ROOFY.state.propertyRegion]);
    if (ROOFY.state.propertyBeds !== 'all') active.push(T.properties.beds[ROOFY.state.propertyBeds]);
    active.forEach(function (a) {
        crumbs.push('<span class="text-slate-300">/</span>');
        crumbs.push('<span class="text-amber-600 font-medium">' + a + '</span>');
    });

    return '<nav class="flex items-center flex-wrap gap-2 text-xs text-slate-500">' + crumbs.join('') + '</nav>';
}

function filterPanel() {
    const T = ROOFY.tr();
    const all = window.ROOFY_DATA.properties || [];
    const matched = applyFilters(all);

    /* regions present in data only */
    const regionsInData = {};
    all.forEach(function (p) { if (p.region) regionsInData[p.region] = true; });
    const regionOptions = [{ value: 'all', label: T.properties.regionAll }].concat(
        Object.keys(T.properties.regions).filter(function (r) { return regionsInData[r]; })
            .map(function (r) { return { value: r, label: T.properties.regions[r] }; })
    );

    const transactionOptions = [
        { value: 'all', label: T.properties.transaction.all },
        { value: 'sale', label: T.properties.transaction.sale },
        { value: 'rent', label: T.properties.transaction.rent }
    ];
    const typeOptions = ['all', 'new', 'resale', 'rent', 'land'].map(function (k) {
        return { value: k, label: T.featured.filters[k] };
    });
    const bedsOptions = ['all', '1', '3', '4', '5'].map(function (k) {
        return { value: k, label: T.properties.beds[k] };
    });
    const sortOptions = ['default', 'asc', 'desc'].map(function (k) {
        return { value: k, label: T.properties.sort[k] };
    });

    const isFiltered = ROOFY.state.propertyFilter !== 'all' || ROOFY.state.propertyRegion !== 'all'
        || ROOFY.state.propertyTransaction !== 'all' || ROOFY.state.propertyBeds !== 'all'
        || (ROOFY.state.propertySort || 'default') !== 'default'
        || (ROOFY.state.propertySearch || '').length > 0;

    return '<section id="browse" class="py-8 lg:py-10 bg-white border-b border-slate-200 scroll-mt-20">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        /* breadcrumb */
        '<div class="mb-5">' + breadcrumbBar() + '</div>' +
        /* search bar */
        '<div class="relative mb-5">' +
        '<i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>' +
        '<input id="property-search" type="text" autocomplete="off" value="' + escapeAttr(ROOFY.state.propertySearch || '') + '"' +
        ' placeholder="' + escapeAttr(T.properties.search.placeholder) + '"' +
        ' oninput="setPropertySearch(this.value)"' +
        ' class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-10 h-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors">' +
        (ROOFY.state.propertySearch ? '<button onclick="setPropertySearch(\'\')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1" aria-label="' + escapeAttr(T.properties.search.clear) + '">' +
            '<i data-lucide="x" class="w-4 h-4"></i></button>' : '') +
        '</div>' +
        /* faceted filter rows — hairline band, no boxed panel */
        '<div class="border-y border-slate-200">' +
        facetRow(T.properties.transaction.label, transactionOptions, ROOFY.state.propertyTransaction, 'setPropertyTransaction') +
        facetRow(T.properties.typeLabel, typeOptions, ROOFY.state.propertyFilter, 'setFilter') +
        facetRow(T.properties.regionLabel, regionOptions, ROOFY.state.propertyRegion, 'setPropertyRegion') +
        facetRow(T.properties.bedsLabel, bedsOptions, ROOFY.state.propertyBeds, 'setPropertyBeds') +
        facetRow(T.properties.sort.label, sortOptions, ROOFY.state.propertySort || 'default', 'setPropertySort') +
        '</div>' +
        /* result count + reset */
        '<div class="flex items-center justify-between gap-3 mt-5">' +
        '<div class="text-sm text-slate-600">' + T.properties.found.replace('{n}', '<span class="text-amber-600 font-semibold">' + matched.length + '</span>') + '</div>' +
        (isFiltered ? '<button onclick="resetPropertyFilters()" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">' +
            '<i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>' + T.properties.reset + '</button>' : '') +
        '</div>' +
        '</div></section>';
}

/* List-row item — image left, info middle, price right (搜房网 list view). */
function listRow(p, T) {
    const lang = ROOFY.state.lang;
    const title = lang === 'zh' ? p.titleZh : p.titleEn;
    const tag = T.featured.filters[p.type];
    const txn = p.transactionType || 'sale';
    const txnLabel = (T.properties.chipFor && T.properties.chipFor[txn]) || '';
    const regionLabel = p.region && T.properties.regions ? T.properties.regions[p.region] : '';

    const specChips = [];
    if (p.beds > 0) specChips.push(p.beds + ' ' + T.featured.bedroom + ' / ' + p.baths + ' ' + T.featured.bathroom);
    if (p.area && p.area !== '—') specChips.push(p.area);
    const chipsHtml = specChips.map(function (c) {
        return '<span class="inline-flex items-center px-2.5 py-1 rounded-sm bg-slate-100 text-slate-600 text-xs">' + c + '</span>';
    }).join('');

    return '<a href="/properties/detail.html?id=' + encodeURIComponent(p.id) + '" ' +
        'class="group flex flex-col sm:flex-row gap-4 sm:gap-6 border-b border-slate-200 pb-8">' +
        /* image */
        '<div class="img-zoom relative w-full sm:w-64 lg:w-72 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-slate-100">' +
        '<img src="' + p.img + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + escapeAttr(title) + '" loading="lazy" decoding="async" class="w-full h-full object-cover" />' +
        '<div class="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">' +
        '<span class="text-[10px] font-semibold uppercase tracking-wider bg-amber-500 text-slate-900 px-2 py-0.5 rounded-sm">' + tag + '</span>' +
        (txnLabel ? '<span class="text-[10px] font-semibold uppercase tracking-wider ' + (txn === 'rent' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200') + ' px-2 py-0.5 rounded-sm">' + txnLabel + '</span>' : '') +
        (p.placeholder ? '<span class="text-[10px] font-semibold uppercase tracking-wider bg-slate-900/70 backdrop-blur text-white px-2 py-0.5 rounded-sm">' + T.featured.sample + '</span>' : '') +
        '</div></div>' +
        /* info + price */
        '<div class="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">' +
        '<div class="flex-1 min-w-0">' +
        '<h3 class="text-lg font-semibold text-slate-900 mb-2 leading-snug group-hover:text-amber-600 transition-colors">' + title + '</h3>' +
        '<div class="flex items-center gap-1.5 text-sm text-slate-500 mb-3">' +
        '<i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0"></i><span class="truncate">' + (p.loc || '') + '</span>' +
        (regionLabel ? '<span class="ml-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600">· ' + regionLabel + '</span>' : '') +
        '</div>' +
        '<div class="flex flex-wrap gap-2">' + chipsHtml + '</div>' +
        '</div>' +
        /* price column */
        '<div class="shrink-0 sm:text-right sm:pl-5 sm:border-l border-slate-100">' +
        '<div class="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">' + (T.properties.detail ? T.properties.detail.priceLabel : 'Price') + '</div>' +
        '<div class="text-amber-600 font-semibold text-xl leading-tight">' + p.price + '</div>' +
        '<div class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors mt-3">' +
        (lang === 'zh' ? '查看详情' : 'View detail') + '<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></div>' +
        '</div>' +
        '</div></a>';
}

function listingRows() {
    const T = ROOFY.tr();
    const all = window.ROOFY_DATA.properties || [];
    const list = applyFilters(all);

    if (all.length === 0) {
        return '<section class="py-16 bg-slate-50"><div class="max-w-[1280px] mx-auto px-6 lg:px-10 text-center text-slate-500 text-sm">Loading listings…</div></section>';
    }

    if (list.length === 0) {
        return '<section class="py-16 lg:py-24 bg-slate-50">' +
            '<div class="max-w-2xl mx-auto px-6 lg:px-10 text-center">' +
            '<i data-lucide="search-x" class="w-10 h-10 mx-auto text-slate-400 mb-5"></i>' +
            '<p class="text-slate-600 leading-relaxed mb-8">' + T.properties.empty + '</p>' +
            '<div class="flex flex-wrap items-center justify-center gap-3">' +
            '<button onclick="resetPropertyFilters()" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold text-sm px-5 h-11 rounded-sm transition-colors">' +
            '<i data-lucide="rotate-ccw" class="w-4 h-4"></i>' + T.properties.reset + '</button>' +
            '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-5 h-11 rounded-sm transition-colors">' +
            T.cta.contact + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
            '</div></div></section>';
    }

    const rows = applySort(list).map(function (p) { return listRow(p, T); }).join('');
    return '<section class="py-10 lg:py-14 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col gap-8">' + rows + '</div>' +
        '</div></section>';
}

function propertiesCta() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    return '<section class="relative py-20 lg:py-28 bg-slate-900 text-white overflow-hidden">' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Off-market</div>' +
        '<h2 class="text-2xl md:text-4xl font-semibold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' +
        (lang === 'zh' ? '没找到合适的？我们手上还有未公开房源。' : 'Didn\'t find what you need? We also represent off-market opportunities.') +
        '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 transition-colors" data-reveal-up>' +
        T.cta.contact + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        propertiesHero() +
        featuredProjectsBand() +
        filterPanel() +
        listingRows() +
        propertiesCta() +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadAllData() {
    return Promise.all([
        fetch('/assets/data/properties.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
        fetch('/assets/data/projects.json').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (results) {
        window.ROOFY_DATA.properties = (results[0] && results[0].items) || [];
        window.ROOFY_DATA.projects = (results[1] && results[1].projects) || [];
    });
}

window.addEventListener('DOMContentLoaded', function () {
    /* Deep-links: ?type=&region=&txn=&beds=&q= */
    var fromSearch = false;
    try {
        const qs = new URLSearchParams(location.search);
        const t = qs.get('type'); if (t && ['all', 'new', 'resale', 'rent', 'land'].indexOf(t) >= 0) ROOFY.state.propertyFilter = t;
        const r = qs.get('region'); if (r) ROOFY.state.propertyRegion = r;
        const tx = qs.get('txn'); if (tx && ['all', 'sale', 'rent'].indexOf(tx) >= 0) ROOFY.state.propertyTransaction = tx;
        const b = qs.get('beds'); if (b && ['all', '1', '3', '4', '5'].indexOf(b) >= 0) ROOFY.state.propertyBeds = b;
        const q = qs.get('q'); if (q) ROOFY.state.propertySearch = q;
        const so = qs.get('sort'); if (so && ['asc', 'desc'].indexOf(so) >= 0) ROOFY.state.propertySort = so;
        fromSearch = !!(qs.get('txn') || qs.get('type') || qs.get('region') || qs.get('beds') || qs.get('q'));
    } catch (_) { }
    loadAllData().then(function () {
        ROOFY.boot({ page: 'properties' });
        /* Arriving from the home search: skip the hero montage and land on the
         * filters + results so the user sees what they searched for. Wait two
         * frames so layout (the fixed-ratio image grid) settles before we
         * measure; scroll-mt-20 on #browse leaves room for the fixed navbar. */
        if (fromSearch) {
            var landOnResults = function () {
                var el = document.getElementById('browse');
                if (el) el.scrollIntoView({ block: 'start' });
            };
            /* Several passes so a late image reflow can't strand us: next frame,
             * a short timer, and once every image has finished loading. */
            requestAnimationFrame(function () { requestAnimationFrame(landOnResults); });
            setTimeout(landOnResults, 300);
            window.addEventListener('load', landOnResults, { once: true });
        }
    });
});
