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
        ? '一家立足卢萨卡，连接中赞两地的多业务公司。'
        : 'A multi-service company rooted in Lusaka, bridging China and Zambia.';
    const desc = lang === 'zh'
        ? 'Roofy Investments Zambia 2024 年在卢萨卡 Ibex Hill 成立。我们以房地产、LED 户外广告与品牌营销为根基，通过资源整合与系统化运营，参与卢萨卡城市升级的每一个关键节点。'
        : 'Roofy Investments Zambia was founded in 2024 at Ibex Hill, Lusaka. Anchored in real estate, LED outdoor advertising and brand marketing, we integrate fragmented resources and run them as a single system — at every key node of Lusaka\'s urban upgrade.';
    return '<section class="relative bg-slate-900 pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute inset-0"><img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" data-placeholder="true" alt="" class="w-full h-full object-cover opacity-25" />' +
        '<div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-slate-900/60"></div></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wider uppercase">' + eyebrow + '</span></span>' +
        '<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl"><span class="block reveal-mask"><span class="reveal-line">' + title + '</span></span></h1>' +
        '<div class="reveal-mask max-w-2xl"><p class="reveal-line text-base lg:text-lg text-slate-300 leading-relaxed">' + desc + '</p></div>' +
        '</div></section>';
}

function missionVisionRow() {
    const T = ROOFY.tr();
    function tile(eyebrow, title, desc) {
        return '<div class="p-8 lg:p-10 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow" data-reveal-up>' +
            '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + eyebrow + '</div>' +
            '<h3 class="text-2xl font-bold text-slate-900 mb-4 leading-snug">' + title + '</h3>' +
            '<p class="text-slate-600 leading-relaxed">' + desc + '</p>' +
            '</div>';
    }
    return '<section class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6">' +
        tile(T.mission.eyebrow, T.mission.title, T.mission.desc) +
        tile(T.vision.eyebrow, T.vision.title, T.vision.desc) +
        '</div></section>';
}

function valuesGrid() {
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
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">' + items + '</div>' +
        '</div></section>';
}

function businessScopeSection() {
    const T = ROOFY.tr();
    if (!T.businessScope) return '';
    const items = T.businessScope.items.map(function (b) {
        return '<article data-reveal-up class="group flex gap-5 p-6 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow">' +
            '<div class="shrink-0 w-12 h-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">' +
            '<i data-lucide="' + b.icon + '" class="w-6 h-6"></i></div>' +
            '<div class="flex-1 min-w-0">' +
            '<div class="flex items-baseline gap-2 mb-1.5">' +
            '<span class="text-xs text-amber-600 font-semibold">' + b.tag + '</span>' +
            '<h3 class="text-base font-bold text-slate-900">' + b.t + '</h3></div>' +
            '<p class="text-sm text-slate-600 leading-relaxed">' + b.d + '</p>' +
            '</div></article>';
    }).join('');
    return '<section id="business-scope" class="py-20 lg:py-28 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="max-w-2xl mb-10">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.businessScope.eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-reveal-up>' + T.businessScope.title + '</h2>' +
        '<p class="text-slate-600 leading-relaxed" data-reveal-up>' + T.businessScope.desc + '</p></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">' + items + '</div>' +
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
        ? '今天，我们的团队覆盖房地产、广告与品牌三个方向，办公室坐落在卢萨卡 Ibex Hill 的 Second Street。我们相信：少而美的项目、对客户的承诺，以及对工艺的尊重，是一家公司能走得更远的真正原因。'
        : 'Today, our team spans real estate, advertising and brand — headquartered on Second Street, Ibex Hill, Lusaka. We believe in fewer but better projects, deep commitments to clients, and a respect for craft. Those, more than anything, are what carry a company through time.';
    return '<section class="py-20 lg:py-28 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">' +
        '<div class="lg:col-span-5">' +
        '<div class="aspect-[4/5] overflow-hidden rounded-xl bg-slate-200 shadow-lg" data-reveal-up>' +
        '<img src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200" data-placeholder="true" alt="Lusaka skyline" class="w-full h-full object-cover" />' +
        '</div></div>' +
        '<div class="lg:col-span-7 lg:pt-4">' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + eyebrow + '</div>' +
        '<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6" data-reveal-up>' + title + '</h2>' +
        '<p class="text-slate-700 leading-relaxed mb-5 max-w-xl" data-reveal-up>' + p1 + '</p>' +
        '<p class="text-slate-500 leading-relaxed max-w-xl" data-reveal-up>' + p2 + '</p>' +
        '</div></div></section>';
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
            return '<div data-reveal-up class="group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">' +
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
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.team.eyebrow + '</div>' +
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
        '<div class="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10 text-center">' +
        '<div class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5" data-reveal-up>Build · Brand · Grow with Roofy</div>' +
        '<h2 class="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto mb-10 leading-tight" data-reveal-up>' + T.cta.ctaBig + '</h2>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 rounded-md transition-colors shadow-lg shadow-amber-500/20" data-reveal-up>' +
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
