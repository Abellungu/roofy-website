/* Project detail page. ?id=<slug> resolves to one project from
 * /assets/data/projects.json. Renders full-bleed hero, spec table, long
 * description, key features list, gallery and a related-projects rail. */
window.ROOFY_DATA = window.ROOFY_DATA || { projects: [] };
window.ROOFY_PAGE = { id: 'project-detail', whatsapp: 'project-detail' };

function currentProjectId() {
    try { return new URLSearchParams(location.search).get('id'); }
    catch (_) { return null; }
}

function currentProject() {
    const id = currentProjectId();
    if (!id) return null;
    return (window.ROOFY_DATA.projects || []).find(function (p) { return p.id === id; }) || null;
}

function statusBadge(status, T) {
    const label = (T.projects.statusLabels && T.projects.statusLabels[status]) || status;
    const tone = {
        selling: 'bg-amber-500 text-slate-900',
        delivered: 'bg-emerald-500 text-white',
        'sold-out': 'bg-rose-600 text-white',
        'under-construction': 'bg-slate-200 text-slate-900',
        upcoming: 'bg-slate-700 text-white'
    }[status] || 'bg-slate-200 text-slate-900';
    return '<span class="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md ' + tone + '">' + label + '</span>';
}

function notFoundBlock() {
    const T = ROOFY.tr();
    return '<section class="bg-slate-50 min-h-[60vh] flex items-center">' +
        '<div class="max-w-[640px] mx-auto px-6 lg:px-10 py-24 text-center">' +
        '<i data-lucide="file-question" class="w-12 h-12 mx-auto mb-6 text-slate-400"></i>' +
        '<h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4">' +
        (ROOFY.state.lang === 'zh' ? '项目未找到' : 'Project not found') + '</h1>' +
        '<p class="text-slate-600 mb-8">' + T.projects.notFound + '</p>' +
        '<a href="/properties/index.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-md transition-colors">' +
        T.projects.notFoundCta + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

function projectHero(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const name = lang === 'zh' ? p.nameZh : p.nameEn;
    const tagline = lang === 'zh' ? p.taglineZh : p.taglineEn;
    return '<section class="relative bg-slate-900 pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute inset-0">' +
        '<img src="' + p.heroImg + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + name + '" class="w-full h-full object-cover opacity-35" />' +
        '<div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-900/80"></div>' +
        '</div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<a href="/properties/index.html" class="reveal-mask inline-flex"><span class="reveal-line inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors mb-8">' +
        '<i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>' + T.projects.back + '</span></a>' +
        '<div class="flex flex-wrap items-center gap-2 mb-5">' + statusBadge(p.status, T) +
        (p.placeholder ? '<span class="text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md">' + T.projects.sample + '</span>' : '') +
        '</div>' +
        '<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"><span class="block reveal-mask"><span class="reveal-line">' + name + '</span></span></h1>' +
        (tagline ? '<div class="reveal-mask max-w-2xl mb-8"><p class="reveal-line text-base lg:text-lg text-slate-300 leading-relaxed">' + tagline + '</p></div>' : '') +
        '<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">' +
        (p.location ? '<span class="inline-flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i>' + p.location + '</span>' : '') +
        (p.priceRange ? '<span class="inline-flex items-center gap-1.5 text-amber-400 font-semibold"><i data-lucide="tag" class="w-3.5 h-3.5"></i>' + p.priceRange + '</span>' : '') +
        '</div>' +
        '</div></section>';
}

function specTable(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const rows = [
        [T.projects.specs.propertyType, lang === 'zh' ? p.propertyTypeZh : p.propertyTypeEn],
        [T.projects.specs.location, p.location],
        [T.projects.specs.priceRange, p.priceRange || T.projects.priceOnRequest],
        [T.projects.specs.totalUnits, p.totalUnits ? p.totalUnits + T.projects.unitsSuffix : ''],
        [T.projects.specs.developmentArea, lang === 'zh' ? p.developmentAreaZh : p.developmentAreaEn],
        [T.projects.specs.launchYear, p.launchYear || ''],
        [T.projects.specs.expectedDelivery, lang === 'zh' ? p.expectedDeliveryZh : p.expectedDeliveryEn]
    ].filter(function (r) { return !!r[1]; });

    const cells = rows.map(function (r) {
        return '<div class="py-4 border-b border-slate-100 last:border-b-0 flex items-baseline justify-between gap-4">' +
            '<div class="text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0">' + r[0] + '</div>' +
            '<div class="text-sm text-slate-900 font-medium text-right">' + r[1] + '</div></div>';
    }).join('');

    return '<div class="bg-white border border-slate-100 rounded-xl shadow-sm p-6 lg:p-8">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4">' +
        (ROOFY.state.lang === 'zh' ? '关键信息' : 'At a glance') + '</div>' +
        cells + '</div>';
}

function inquireCard(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const name = lang === 'zh' ? p.nameZh : p.nameEn;
    const subject = '咨询项目 / Project inquiry: ' + name + ' [' + p.id + ']';
    return '<div class="bg-slate-900 text-white rounded-xl p-6 lg:p-8 mt-5">' +
        '<div class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">' + T.projects.inquire + '</div>' +
        '<p class="text-sm text-slate-300 leading-relaxed mb-5">' + T.projects.inquireDesc + '</p>' +
        '<div class="flex flex-col gap-2">' +
        '<a href="mailto:roofy@mingyangrt.com?subject=' + encodeURIComponent(subject) + '" class="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-5 h-11 rounded-md transition-colors">' +
        '<i data-lucide="mail" class="w-4 h-4"></i>' + (lang === 'zh' ? '发送邮件咨询' : 'Send by email') + '</a>' +
        '<a href="https://wa.me/260964813736?text=' + encodeURIComponent(T.whatsapp['project-detail'] + ' (' + name + ')') + '" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 h-11 rounded-md transition-colors">' +
        '<i data-lucide="message-circle" class="w-4 h-4"></i>WhatsApp</a>' +
        '</div></div>';
}

function projectBody(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const description = lang === 'zh' ? p.descriptionZh : p.descriptionEn;
    const paragraphs = (description || '').split('\n\n').map(function (para) {
        return '<p>' + para + '</p>';
    }).join('');

    const features = (p.keyFeatures || []).map(function (f) {
        const text = lang === 'zh' ? f.zh : f.en;
        return '<li class="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0">' +
            '<i data-lucide="check-circle" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5"></i>' +
            '<span class="text-sm text-slate-700 leading-relaxed">' + text + '</span></li>';
    }).join('');

    return '<section class="py-12 lg:py-20 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">' +
        '<div class="lg:col-span-7" data-reveal-up>' +
        '<div class="prose-article">' + paragraphs + '</div>' +
        (features ? '<div class="mt-10"><div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4">' + T.projects.keyFeatures + '</div>' +
            '<ul class="bg-white border border-slate-100 rounded-xl shadow-sm p-2 lg:p-4">' + features + '</ul></div>' : '') +
        '</div>' +
        '<div class="lg:col-span-5">' +
        specTable(p) +
        inquireCard(p) +
        '</div></div></section>';
}

function gallerySection(p) {
    const T = ROOFY.tr();
    const gallery = p.gallery || [];
    if (!gallery.length) return '';
    const items = gallery.map(function (src, i) {
        const aspect = i % 3 === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]';
        return '<div class="img-zoom overflow-hidden rounded-xl ' + aspect + ' bg-slate-100" data-reveal-up>' +
            '<img src="' + src + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + (p.nameEn || p.nameZh) + '" loading="lazy" class="w-full h-full object-cover" />' +
            '</div>';
    }).join('');
    return '<section class="py-16 lg:py-24 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10" data-reveal-up>' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + T.projects.gallery + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900">' +
        (ROOFY.state.lang === 'zh' ? p.nameZh + ' · 画册' : p.nameEn + ' · Gallery') +
        '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">' + items + '</div>' +
        '</div></section>';
}

function relatedProjects(p) {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const all = window.ROOFY_DATA.projects || [];
    const list = all.filter(function (q) { return q.id !== p.id; }).slice(0, 3);
    if (!list.length) return '';

    function badge(status) {
        const label = (T.projects.statusLabels && T.projects.statusLabels[status]) || status;
        const tone = {
            selling: 'bg-amber-500 text-slate-900',
            delivered: 'bg-emerald-500 text-white',
            'under-construction': 'bg-slate-200 text-slate-900',
            upcoming: 'bg-slate-700 text-white'
        }[status] || 'bg-slate-200 text-slate-900';
        return '<span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ' + tone + '">' + label + '</span>';
    }

    const cards = list.map(function (r) {
        const name = lang === 'zh' ? r.nameZh : r.nameEn;
        const tagline = lang === 'zh' ? r.taglineZh : r.taglineEn;
        return '<a href="/projects/detail.html?id=' + encodeURIComponent(r.id) + '" ' +
            'class="group block bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-300" data-reveal-up>' +
            '<div class="img-zoom relative aspect-[16/10] overflow-hidden bg-slate-100">' +
            '<img src="' + r.heroImg + '" data-placeholder="' + (r.placeholder ? 'true' : 'false') + '" alt="' + name + '" loading="lazy" class="w-full h-full object-cover" />' +
            '<div class="absolute top-3 left-3">' + badge(r.status) + '</div>' +
            '</div>' +
            '<div class="p-5">' +
            '<h3 class="text-base font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">' + name + '</h3>' +
            '<p class="text-xs text-slate-600 line-clamp-2">' + (tagline || '') + '</p>' +
            '</div></a>';
    }).join('');

    return '<section class="py-16 lg:py-20 bg-white border-t border-slate-200">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.projects.related + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-8" data-reveal-up>' +
        (lang === 'zh' ? '继续看看其他项目' : 'Browse other projects') + '</h2>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">' + cards + '</div>' +
        '</div></section>';
}

window.renderPage = function () {
    if (!(window.ROOFY_DATA.projects && window.ROOFY_DATA.projects.length)) {
        return PARTIALS.navHtml() +
            '<main><div class="py-32 text-center text-slate-500">Loading…</div></main>' +
            PARTIALS.footerHtml();
    }
    const p = currentProject();
    if (!p) {
        return PARTIALS.navHtml() +
            '<main>' + notFoundBlock() + '</main>' +
            PARTIALS.footerHtml();
    }

    /* Update <title> + inject Place JSON-LD for SEO. */
    try {
        document.title = (p.nameEn || p.nameZh) + ' — Roofy Projects';
        const head = document.head;
        let existing = head.querySelector('script[data-roofy-jsonld="project"]');
        if (existing) existing.remove();
        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.dataset.roofyJsonld = 'project';
        ld.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ApartmentComplex',
            name: p.nameEn || p.nameZh,
            description: (p.taglineEn || p.taglineZh || ''),
            image: p.heroImg,
            address: { '@type': 'PostalAddress', addressLocality: p.location || 'Lusaka', addressCountry: 'ZM' },
            numberOfAccommodationUnits: p.totalUnits
        });
        head.appendChild(ld);
    } catch (_) { }

    return PARTIALS.navHtml() +
        '<main>' +
        projectHero(p) +
        projectBody(p) +
        gallerySection(p) +
        relatedProjects(p) +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadProjects() {
    return fetch('/assets/data/projects.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { window.ROOFY_DATA.projects = (d && d.projects) || []; })
        .catch(function () { });
}

window.addEventListener('DOMContentLoaded', function () {
    loadProjects().then(function () { ROOFY.boot({ page: 'properties' }); });
});
