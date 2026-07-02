/* About page — slate + amber register (matches 模板1).
 * Sections: hero → mission/vision → values (4) → business scope (7) →
 *           founding story → compact team grid → CTA banner.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { team: [] };
window.ROOFY_PAGE = { id: 'about', whatsapp: 'about' };

function aboutHero() {
    const lang = ROOFY.state.lang;
    const eyebrow = lang === 'zh' ? '关于我们' : 'About';
    const title = lang === 'zh' ? '立足赞比亚，连接中赞。' : 'Rooted in Zambia, bridging China.';
    const heroImg = '/assets/img/office/office-lobby.jpg';
    return '<section id="top" class="hero-cinematic relative min-h-[68vh] flex" style="background-image:url(\'' + heroImg + '\')" data-hero-reveal>' +
        '<div class="relative w-full max-w-[1280px] mx-auto px-6 lg:px-10 flex items-end pt-32 pb-14 lg:pb-20">' +
        '<div class="max-w-3xl">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line text-xs font-semibold tracking-[0.25em] text-amber-400 uppercase">' + eyebrow + '</span></span>' +
        '<h1 class="font-display font-medium text-white leading-[0.95] text-5xl sm:text-6xl lg:text-7xl"><span class="block reveal-mask"><span class="reveal-line">' + title + '</span></span></h1>' +
        '</div></div></section>';
}

function missionVisionRow() {
    const T = ROOFY.tr();
    function tile(eyebrow, title, desc) {
        return '<div class="border-t border-slate-300 pt-10" data-reveal-up>' +
            '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-5">' + eyebrow + '</div>' +
            '<h3 class="font-display text-3xl lg:text-4xl font-medium text-slate-900 mb-5 leading-tight">' + title + '</h3>' +
            '<p class="text-slate-600 leading-relaxed lg:text-lg">' + desc + '</p>' +
            '</div>';
    }
    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">' +
        tile(T.mission.eyebrow, T.mission.title, T.mission.desc) +
        tile(T.vision.eyebrow, T.vision.title, T.vision.desc) +
        '</div></section>';
}

function valuesGrid() {
    const T = ROOFY.tr();
    const rows = T.values.items.map(function (v, i) {
        return '<div data-reveal-up class="group grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-2 items-baseline border-t border-slate-300 py-8 lg:py-12">' +
            '<div class="lg:col-span-1 text-sm font-semibold text-amber-600 tracking-widest">' + String(i + 1).padStart(2, '0') + '</div>' +
            '<div class="lg:col-span-5"><h3 class="font-display text-3xl lg:text-4xl font-medium text-slate-900 leading-tight">' + v.t + '</h3>' +
            '<div class="text-xs text-slate-400 uppercase tracking-wider mt-2">' + v.e + '</div></div>' +
            '<p class="lg:col-span-6 text-sm lg:text-base text-slate-500 leading-relaxed lg:pt-2">' + v.d + '</p>' +
            '</div>';
    }).join('');
    return '<section id="values" class="py-16 md:py-28 lg:py-40 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12 lg:mb-16">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.values.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + T.values.title + '</h2></div>' +
        '<div class="border-b border-slate-300">' + rows + '</div>' +
        '</div></section>';
}

function businessScopeSection() {
    const T = ROOFY.tr();
    if (!T.businessScope) return '';
    const rows = T.businessScope.items.map(function (b) {
        return '<div data-reveal-up class="group grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-2 items-baseline border-t border-slate-300 py-7 lg:py-9">' +
            '<div class="lg:col-span-1 text-sm font-semibold text-amber-600 tracking-widest">' + b.tag + '</div>' +
            '<h3 class="lg:col-span-5 font-display text-2xl lg:text-3xl font-medium text-slate-900 leading-tight">' + b.t + '</h3>' +
            '<p class="lg:col-span-6 text-sm lg:text-base text-slate-500 leading-relaxed lg:pt-1.5">' + b.d + '</p>' +
            '</div>';
    }).join('');
    return '<section id="business-scope" class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12 lg:mb-16">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.businessScope.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + T.businessScope.title + '</h2></div>' +
        '<div class="border-b border-slate-300">' + rows + '</div>' +
        '</div></section>';
}

function foundingStory() {
    const lang = ROOFY.state.lang;
    const eyebrow = lang === 'zh' ? '我们的故事' : 'Our story';
    const title = lang === 'zh' ? '始于 2024 · 立足 Ibex Hill。' : 'Founded 2024 · Based in Ibex Hill.';
    const p1 = lang === 'zh'
        ? '中赞往来日益密切，却少有本地公司能同时理解两边的语境。ROOFY 选择填补这个空白：以统一的专业标准，服务两边的客户。'
        : 'As China and Zambia grow closer, few local firms speak both contexts fluently. ROOFY was built to fill that gap — serving both sides to one standard.';
    return '<section class="py-16 md:py-28 lg:py-40 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">' +
        '<div class="lg:col-span-6">' +
        '<div class="aspect-[4/3] overflow-hidden bg-slate-200" data-reveal-up>' +
        '<img src="/assets/img/office/office-lobby.jpg" alt="ROOFY office lobby" class="w-full h-full object-cover" />' +
        '</div></div>' +
        '<div class="lg:col-span-6">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4" data-reveal-up>' + eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900 mb-6 leading-tight" data-reveal-up>' + title + '</h2>' +
        '<p class="text-slate-700 leading-relaxed lg:text-lg max-w-xl" data-reveal-up>' + p1 + '</p>' +
        '</div></div></section>';
}

function officeGallery() {
    const lang = ROOFY.state.lang;
    const eyebrow = lang === 'zh' ? '办公环境' : 'Our workspace';
    const title = lang === 'zh' ? '欢迎来 Ibex Hill 坐一坐。' : 'Come sit with us at Ibex Hill.';
    const imgs = [
        ['/assets/img/office/office-values-wall.jpg', 'Mission and values wall'],
        ['/assets/img/office/office-boardroom.jpg', 'Boardroom'],
        ['/assets/img/office/office-terrace.jpg', 'Garden terrace']
    ];
    const cells = imgs.map(function (im) {
        return '<div data-reveal-up class="img-zoom overflow-hidden aspect-[4/3] bg-slate-200">' +
            '<img src="' + im[0] + '" alt="' + im[1] + '" loading="lazy" class="w-full h-full object-cover" /></div>';
    }).join('');
    return '<section class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12 lg:mb-16">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">' + cells + '</div>' +
        '</div></section>';
}

function teamSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    const members = window.ROOFY_DATA.team || [];
    const cards = members.length === 0
        ? '<div class="col-span-full text-center py-12 text-slate-500 text-sm">Loading team…</div>'
        : members.map(function (m, i) {
            const name = lang === 'zh' && m.nameZh ? m.nameZh : m.name;
            const role = lang === 'zh' ? m.roleZh : m.role;
            const photo = m.photo
                ? '<img src="' + m.photo + '" alt="' + m.name + '" loading="lazy" class="w-full h-full object-cover" />'
                : '<div class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-display text-3xl">' + (m.initials || '·') + '</div>';
            return '<div data-reveal-up class="group">' +
                '<div class="aspect-[4/5] overflow-hidden bg-slate-100 mb-4">' + photo + '</div>' +
                '<div class="text-base font-semibold text-slate-900">' + name + '</div>' +
                '<div class="text-xs text-amber-600 font-semibold uppercase tracking-wider mt-1">' + role + '</div>' +
                '</div>';
        }).join('');

    return '<section id="team" class="py-16 md:py-28 lg:py-40 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-16">' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.team.eyebrow + '</div>' +
        '<h2 class="font-display text-4xl md:text-5xl font-semibold text-slate-900" data-reveal-up>' + T.team.title + '</h2></div>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        (lang === 'zh' ? '与团队对话' : 'Talk to the team') +
        '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-10">' + cards + '</div>' +
        '</div></section>';
}

function aboutCtaBanner() {
    const T = ROOFY.tr();
    return '<section class="relative py-16 md:py-28 lg:py-40 bg-slate-900 text-white overflow-hidden">' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-semibold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 transition-colors" data-reveal-up>' +
        T.cta.ctaBtn + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        aboutHero() +
        missionVisionRow() +
        valuesGrid() +
        businessScopeSection() +
        foundingStory() +
        officeGallery() +
        teamSection() +
        aboutCtaBanner() +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadAboutData() {
    return fetch('/assets/data/team.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { window.ROOFY_DATA.team = (d && d.members) || []; })
        .catch(function () { });
}

window.addEventListener('DOMContentLoaded', function () {
    loadAboutData().then(function () { ROOFY.boot({ page: 'about' }); });
});
