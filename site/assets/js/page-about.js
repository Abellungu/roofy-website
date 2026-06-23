/* About page — slate + amber register (matches 模板1).
 * Sections: hero → mission/vision → values (4) → business scope (7) →
 *           founding story → compact team grid → CTA banner.
 */
window.ROOFY_DATA = window.ROOFY_DATA || { team: [] };
window.ROOFY_PAGE = { id: 'about', whatsapp: 'about' };

function aboutHero() {
    const lang = ROOFY.state.lang;
    const eyebrow = lang === 'zh' ? '关于我们' : 'About';
    const title = lang === 'zh'
        ? '一家立足赞比亚、连接中赞两地的综合性服务集团。'
        : 'A comprehensive services group rooted in Zambia, bridging China and Zambia.';
    const desc = lang === 'zh'
        ? 'Roofy Investments Zambia 2024 年在卢萨卡 Ibex Hill 成立。我们以房地产、LED 户外广告与品牌营销为根基，通过资源整合与系统化运营，参与卢萨卡城市升级的每一个关键节点。'
        : 'Roofy Investments Zambia was founded in 2024 at Ibex Hill, Lusaka. Anchored in real estate, LED outdoor advertising and brand marketing, we integrate fragmented resources and run them as a single system — at every key node of Lusaka\'s urban upgrade.';
    return '<section class="relative bg-slate-50 pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden" data-hero-reveal>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">' +
        '<div class="lg:col-span-7">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line roofy-eyebrow inline-flex text-xs font-bold tracking-[0.25em] text-amber-600 uppercase">' + eyebrow + '</span></span>' +
        '<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.08] mb-6"><span class="block reveal-mask"><span class="reveal-line">' + title + '</span></span></h1>' +
        '<div class="reveal-mask max-w-xl"><p class="reveal-line text-base lg:text-lg text-slate-600 leading-relaxed">' + desc + '</p></div>' +
        '</div>' +
        '<div class="lg:col-span-5 hidden lg:block" data-reveal-up>' +
        '<dl class="border-t-2 border-slate-900 divide-y divide-slate-900/20">' +
        '<div class="py-5"><dt class="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-900/70 mb-1.5">' + (lang === 'zh' ? '成立年份' : 'Founded') + '</dt><dd class="text-4xl lg:text-5xl font-black text-slate-900 leading-none">2024</dd></div>' +
        '<div class="py-5"><dt class="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-900/70 mb-1.5">' + (lang === 'zh' ? '核心业务' : 'Core practices') + '</dt><dd class="text-4xl lg:text-5xl font-black text-slate-900 leading-none">3</dd></div>' +
        '<div class="py-5"><dt class="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-900/70 mb-1.5">' + (lang === 'zh' ? '卢萨卡总部' : 'Lusaka HQ') + '</dt><dd class="text-3xl lg:text-4xl font-black text-slate-900 leading-none">Ibex Hill</dd></div>' +
        '</dl>' +
        '</div>' +
        '</div></div></section>';
}

function missionVisionRow() {
    const T = ROOFY.tr();
    function tile(eyebrow, title, desc) {
        return '<div class="border-t-2 border-slate-900 pt-8 hover:border-amber-500 transition-colors duration-300" data-reveal-up>' +
            '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4">' + eyebrow + '</div>' +
            '<h3 class="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-snug">' + title + '</h3>' +
            '<p class="text-slate-600 leading-relaxed">' + desc + '</p>' +
            '</div>';
    }
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-12">' +
        tile(T.mission.eyebrow, T.mission.title, T.mission.desc) +
        tile(T.vision.eyebrow, T.vision.title, T.vision.desc) +
        '</div></section>';
}

function valuesGrid() {
    const T = ROOFY.tr();
    const items = T.values.items.map(function (v, i) {
        return '<div data-reveal-up class="group border-t-2 border-slate-900 pt-6 hover:border-amber-500 transition-colors duration-300">' +
            '<div class="flex items-center justify-between mb-5">' +
            '<i data-lucide="' + v.icon + '" class="w-5 h-5 text-amber-600"></i>' +
            '<span class="text-xs font-bold tracking-widest text-slate-400">' + String(i + 1).padStart(2, '0') + '</span>' +
            '</div>' +
            '<h3 class="text-lg font-bold text-slate-900 mb-1">' + v.t + '</h3>' +
            '<div class="text-xs text-slate-500 mb-3 uppercase tracking-wider">' + v.e + '</div>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + v.d + '</p>' +
            '</div>';
    }).join('');
    return '<section id="values" class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-12">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.values.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.values.title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">' + items + '</div>' +
        '</div></section>';
}

function businessScopeSection() {
    const T = ROOFY.tr();
    if (!T.businessScope) return '';
    const items = T.businessScope.items.map(function (b) {
        return '<article data-reveal-up class="group border-t-2 border-slate-900 pt-6 hover:border-amber-500 transition-colors duration-300">' +
            '<div class="flex items-center justify-between mb-4">' +
            '<i data-lucide="' + b.icon + '" class="w-5 h-5 text-amber-600"></i>' +
            '<span class="text-xs font-bold tracking-widest text-slate-400">' + b.tag + '</span>' +
            '</div>' +
            '<h3 class="text-base font-bold text-slate-900 mb-2">' + b.t + '</h3>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + b.d + '</p>' +
            '</article>';
    }).join('');
    return '<section id="business-scope" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.businessScope.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-reveal-up>' + T.businessScope.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed" data-reveal-up>' + T.businessScope.desc + '</p></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">' + items + '</div>' +
        '</div></section>';
}

function foundingStory() {
    const lang = ROOFY.state.lang;
    const eyebrow = lang === 'zh' ? '我们的故事' : 'Our story';
    const title = lang === 'zh' ? '始于 2024 · 立足 Ibex Hill。' : 'Founded 2024 · Based in Ibex Hill.';
    const p1 = lang === 'zh'
        ? '我们诞生于赞比亚房地产与媒介行业飞速变化的时刻。中赞之间的资金、商业与文化往来日益密切，而真正能够同时理解两边语境、并以专业标准服务客户的本地公司却屈指可数——这是 ROOFY 选择出发的理由。'
        : 'We were born at a moment when Zambia\'s real-estate and media markets were changing fast. Capital, business and culture flow between China and Zambia like never before — but very few local firms can speak both contexts fluently and serve them with a uniform standard. That is the gap ROOFY chose to step into.';
    const p2 = lang === 'zh'
        ? '今天，我们的团队覆盖房地产、广告与品牌三个方向，办公室坐落在卢萨卡 Ibex Hill 的 Second Street。我们相信：对客户的承诺，以及对工艺的尊重，是一家公司能走得更远的真正原因。'
        : 'Today, our team spans real estate, advertising and brand — headquartered on Second Street, Ibex Hill, Lusaka. We believe in deep commitments to clients and a respect for craft. Those, more than anything, are what carry a company through time.';
    return '<section class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">' +
        '<div class="lg:col-span-5">' +
        '<div class="aspect-[4/5] overflow-hidden rounded-lg bg-slate-200 shadow-lg" data-reveal-up>' +
        '<img src="/assets/img/office/office-lobby.jpg" alt="ROOFY × African Perfect office lobby" class="w-full h-full object-cover" />' +
        '</div></div>' +
        '<div class="lg:col-span-7 lg:pt-4">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6" data-reveal-up>' + title + '</h2>' +
        '<p class="text-slate-700 leading-relaxed mb-5 max-w-xl" data-reveal-up>' + p1 + '</p>' +
        '<p class="text-slate-500 leading-relaxed max-w-xl" data-reveal-up>' + p2 + '</p>' +
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
        return '<div data-reveal-up class="img-zoom overflow-hidden rounded-lg aspect-[4/3] bg-slate-200">' +
            '<img src="' + im[0] + '" alt="' + im[1] + '" loading="lazy" class="w-full h-full object-cover" /></div>';
    }).join('');
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + title + '</h2></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">' + cells + '</div>' +
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
                : '<div class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold">' + (m.initials || '·') + '</div>';
            return '<div data-reveal-up class="group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">' +
                '<div class="shrink-0 w-16 h-16 rounded-full overflow-hidden bg-slate-100 ring-2 ring-amber-500/20">' + photo + '</div>' +
                '<div class="flex-1 min-w-0">' +
                '<div class="text-sm font-bold text-slate-900 truncate">' + name + '</div>' +
                '<div class="text-xs text-amber-600 font-semibold truncate">' + role + '</div>' +
                '</div></div>';
        }).join('');

    return '<section id="team" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">' +
        '<div class="max-w-2xl">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.team.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900" data-reveal-up>' + T.team.title + '</h2></div>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        (lang === 'zh' ? '与团队对话' : 'Talk to the team') +
        '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' + cards + '</div>' +
        '</div></section>';
}

function aboutCtaBanner() {
    const T = ROOFY.tr();
    return '<section class="relative py-20 lg:py-28 bg-slate-900 text-white overflow-hidden">' +
        '<div class="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-gold-gradient hover:brightness-105 text-slate-900 font-bold text-sm px-7 h-12 rounded-sm transition-all shadow-lg shadow-amber-500/25" data-reveal-up>' +
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
