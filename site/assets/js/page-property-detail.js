/* Property detail page — slate+amber register. Reads ?id= against properties.json.
 * Renders hero, specs, description, location (Google Maps embed), inquiry, similar listings.
 * Missing/unknown id renders an in-page not-found block (HTTP-200 from static host).
 * After fetch resolves, also injects a RealEstateListing JSON-LD into <head>.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { properties: [] };
window.ROOFY_PAGE = { id: 'property-detail', whatsapp: 'property-detail' };

const WHATSAPP_RAW = '260964813736';
const MAILTO = 'roofy@mingyangrt.com';

function currentId() {
    try { return new URLSearchParams(location.search).get('id'); } catch (_) { return null; }
}

function currentProperty() {
    const id = currentId();
    if (!id) return null;
    return (window.ROOFY_DATA.properties || []).find(function (p) { return p.id === id; }) || null;
}

function notFoundBlock() {
    const T = ROOFY.tr();
    return '<section class="bg-slate-50 min-h-[60vh] flex items-center">' +
        '<div class="max-w-[640px] mx-auto px-6 lg:px-10 py-24 text-center">' +
        '<i data-lucide="search-x" class="w-12 h-12 mx-auto text-slate-400 mb-6"></i>' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">404 · Listing</div>' +
        '<h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4">' + T.properties.detail.notFoundTitle + '</h1>' +
        '<p class="text-slate-600 leading-relaxed mb-8 max-w-md mx-auto">' + T.properties.detail.notFoundDesc + '</p>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-sm transition-colors">' +
        T.properties.detail.back + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

function detailHero(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const title = lang === 'zh' ? p.titleZh : p.titleEn;
    const tag = T.featured.filters[p.type];
    const txn = p.transactionType || 'sale';
    const txnLabel = (T.properties.chipFor && T.properties.chipFor[txn]) || '';
    return '<section class="relative bg-slate-900 overflow-hidden" data-hero-reveal>' +
        '<div class="relative h-[62vh] min-h-[460px] lg:h-[72vh] overflow-hidden">' +
        '<img src="' + p.img + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + title + '" class="absolute inset-0 w-full h-full object-cover" />' +
        '<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/50"></div>' +
        '<div class="absolute top-24 left-0 right-0">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-amber-400 transition-colors">' +
        '<i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>' + T.properties.detail.back + '</a></div></div>' +
        '<div class="absolute bottom-0 left-0 right-0 pb-8 lg:pb-12">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex items-center gap-1.5 mb-4 reveal-mask"><span class="reveal-line inline-flex items-center gap-1.5">' +
        '<span class="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-900 px-2.5 py-1 rounded-sm">' + tag + '</span>' +
        (txnLabel ? '<span class="text-[10px] font-bold uppercase tracking-wider ' + (txn === 'rent' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900') + ' px-2.5 py-1 rounded-sm">' + txnLabel + '</span>' : '') +
        (p.placeholder ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 backdrop-blur text-slate-200 px-2.5 py-1 rounded-sm">' + T.featured.sample + '</span>' : '') +
        '</span></div>' +
        '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mb-4 reveal-mask"><span class="reveal-line">' + title + '</span></h1>' +
        '<div class="reveal-mask"><div class="reveal-line flex flex-col md:flex-row md:items-end md:justify-between gap-4">' +
        '<div class="flex items-center gap-2 text-slate-200"><i data-lucide="map-pin" class="w-4 h-4 text-amber-400"></i><span>' + p.loc + '</span></div>' +
        '<div class="text-amber-400 font-bold text-3xl lg:text-4xl">' + p.price + '</div>' +
        '</div></div></div></div></section>';
}

function specsStrip(p) {
    const T = ROOFY.tr();
    const items = [
        { label: T.properties.detail.spec.type, value: T.featured.filters[p.type] || '—' },
        { label: T.properties.detail.spec.area, value: p.area || '—' },
        { label: T.properties.detail.spec.beds, value: p.beds > 0 ? String(p.beds) : '—' },
        { label: T.properties.detail.spec.baths, value: p.baths > 0 ? String(p.baths) : '—' },
        { label: T.properties.detail.spec.price, value: p.price }
    ];
    return '<section class="bg-white border-b border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-5 divide-x divide-slate-100">' +
        items.map(function (it, i) {
            return '<div class="py-6 lg:py-8 px-4 lg:px-6 ' + (i === 0 ? 'lg:pl-0' : '') + '">' +
                '<div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">' + it.label + '</div>' +
                '<div class="text-base lg:text-lg font-bold text-slate-900">' + it.value + '</div>' +
                '</div>';
        }).join('') +
        '</div></section>';
}

function descriptionSection(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const desc = (lang === 'zh' ? p.descZh : p.descEn) || '';
    const paras = desc.split(/\n\n+/).filter(Boolean);
    return '<section class="py-16 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">' +
        '<div class="lg:col-span-4">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider" data-reveal-up>' + T.properties.detail.description + '</div>' +
        '</div>' +
        '<div class="lg:col-span-8 prose-article">' +
        paras.map(function (par) { return '<p data-reveal-up>' + par + '</p>'; }).join('') +
        '</div></div></section>';
}

function locationSection(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const query = encodeURIComponent(p.loc + ', Zambia');
    return '<section class="py-16 lg:py-24 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">' +
        '<div><div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.properties.detail.location + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900" data-reveal-up>' + p.loc + '</h2></div>' +
        '<a href="https://maps.google.com/?q=' + query + '" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        (lang === 'zh' ? '在 Google 地图打开' : 'Open in Google Maps') +
        '<i data-lucide="arrow-up-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" data-reveal-up>' +
        '<iframe title="' + p.loc + ' map" src="https://maps.google.com/maps?q=' + query + '&z=14&output=embed" class="w-full h-full" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
        '</div></div></section>';
}

function inquireSection(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const title = lang === 'zh' ? p.titleZh : p.titleEn;
    const subj = '[ROOFY] ' + title + ' [' + p.id + ']';
    const waMsg = T.properties.detail.whatsappPrefill + ' ' + title + ' (' + p.id + ')';
    const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-4 h-11 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors';
    const lbl = function (t) { return '<span class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">' + t + '</span>'; };
    return '<section class="py-16 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">' +
        '<div class="lg:col-span-5">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.cta.contact + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4" data-reveal-up>' + T.properties.detail.inquire + '</h2>' +
        '<p class="text-slate-600 leading-relaxed mb-8 max-w-md" data-reveal-up>' + T.properties.detail.inquireDesc + '</p>' +
        '<a href="https://wa.me/' + WHATSAPP_RAW + '?text=' + encodeURIComponent(waMsg) + '" target="_blank" rel="noopener" class="flex items-center justify-between p-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg shadow-sm transition-colors" data-reveal-up>' +
        '<div><div class="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">WhatsApp</div>' +
        '<div class="font-semibold">' + T.cta.whatsapp + '</div></div>' +
        '<i data-lucide="arrow-up-right" class="w-5 h-5"></i></a>' +
        '</div>' +
        '<div class="lg:col-span-7">' +
        '<form data-reveal-up class="bg-slate-50 border border-slate-100 rounded-lg p-7 lg:p-9" onsubmit="return submitPropertyInquiry(event, \'' + p.id + '\', ' + JSON.stringify(subj).replace(/"/g, '&quot;') + ')">' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">' +
        '<label class="block">' + lbl(T.contact.formName) + '<input type="text" name="name" required class="' + inputCls + '" /></label>' +
        '<label class="block">' + lbl(T.contact.formPhone) + '<input type="tel" name="phone" class="' + inputCls + '" /></label>' +
        '</div>' +
        '<label class="block mb-5">' + lbl(T.contact.formEmail) + '<input type="email" name="email" required class="' + inputCls + '" /></label>' +
        '<label class="block mb-8">' + lbl(T.contact.formMessage) +
        '<textarea name="message" rows="4" required class="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors resize-none">' +
        (lang === 'zh' ? '你好，我想了解「' + title + '」这套房源的详情，方便安排看房或视频沟通。' : 'Hi, I would like to know more about "' + title + '" and arrange a viewing or call.') +
        '</textarea></label>' +
        '<input type="hidden" name="property" value="' + p.id + '">' +
        '<button type="submit" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 rounded-sm transition-colors shadow-sm">' +
        T.cta.send + '<i data-lucide="arrow-right" class="w-4 h-4"></i></button>' +
        '</form></div></div></section>';
}

window.submitPropertyInquiry = function (e, propertyId, subject) {
    e.preventDefault();
    const f = e.target;
    const d = new FormData(f);
    const body = encodeURIComponent(
        'Property: ' + propertyId + '\n' +
        'Name: ' + (d.get('name') || '') + '\n' +
        'Email: ' + (d.get('email') || '') + '\n' +
        'Phone: ' + (d.get('phone') || '') + '\n\n' +
        (d.get('message') || '')
    );
    window.location.href = 'mailto:' + MAILTO + '?subject=' + encodeURIComponent(subject) + '&body=' + body;
    return false;
};

function similarListings(current) {
    const T = ROOFY.tr();
    const all = window.ROOFY_DATA.properties || [];
    const list = all.filter(function (p) { return p.type === current.type && p.id !== current.id; }).slice(0, 3);
    if (list.length === 0) return '';
    return '<section class="py-16 lg:py-24 bg-slate-50 border-t border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="mb-8">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.properties.detail.similar + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900" data-reveal-up>' + T.properties.detail.similarDesc + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">' +
        list.map(function (p) { return window.propertyCard(p, T); }).join('') +
        '</div></div></section>';
}

function injectListingJsonLd(p) {
    if (!p) return;
    const lang = ROOFY.state.lang;
    const title = lang === 'zh' ? p.titleZh : p.titleEn;
    const data = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: title,
        url: location.href,
        image: location.origin + p.img,
        description: (lang === 'zh' ? p.descZh : p.descEn) || title,
        address: { '@type': 'PostalAddress', addressLocality: p.loc, addressCountry: 'ZM' },
        offers: { '@type': 'Offer', price: p.price, priceCurrency: (p.price && p.price.indexOf('$') >= 0) ? 'USD' : 'ZMW' }
    };
    const existing = document.getElementById('roofy-listing-ld');
    if (existing) existing.remove();
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'roofy-listing-ld';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
    try { document.title = title + ' — Roofy Investments Zambia'; } catch (_) { }
}

window.renderPage = function () {
    const p = currentProperty();
    if (!p) {
        return PARTIALS.navHtml() + '<main>' + notFoundBlock() + '</main>' + PARTIALS.footerHtml();
    }
    setTimeout(function () { injectListingJsonLd(p); }, 0);
    return PARTIALS.navHtml() +
        '<main>' +
        detailHero(p) +
        specsStrip(p) +
        descriptionSection(p) +
        locationSection(p) +
        inquireSection(p) +
        similarListings(p) +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadDetailData() {
    return fetch('/assets/data/properties.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { window.ROOFY_DATA.properties = (d && d.items) || []; })
        .catch(function () { });
}

window.addEventListener('DOMContentLoaded', function () {
    loadDetailData().then(function () { ROOFY.boot({ page: 'property-detail' }); });
});
