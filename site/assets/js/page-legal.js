/* Shared renderer for /privacy.html, /cookies.html, /terms.html.
 * Driven by window.ROOFY_PAGE.id (privacy / cookies / terms).
 * Content from /assets/data/legal.json. slate+amber register.
 */
window.ROOFY_DATA = window.ROOFY_DATA || {};
window.ROOFY_PAGE = window.ROOFY_PAGE || { id: 'privacy', whatsapp: 'legal' };

const LEGAL_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
function renderInline(s) {
    /* Tiny inline parser: **bold** and [text](href) → HTML. Keeps everything else literal. */
    return String(s)
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
        .replace(LEGAL_LINK_RE, '<a href="$2" class="text-amber-600 underline underline-offset-2 decoration-amber-300 hover:decoration-amber-600 transition-colors">$1</a>');
}

function currentLegal() {
    const id = (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'privacy';
    const lang = ROOFY.state.lang;
    const root = (window.ROOFY_DATA.legal && window.ROOFY_DATA.legal[lang]) || null;
    return root ? root[id] : null;
}

function legalHero() {
    const T = ROOFY.tr();
    const doc = currentLegal();
    if (!doc) {
        return '<section class="bg-slate-900 pt-32 lg:pt-44 pb-16"><div class="max-w-3xl mx-auto px-6 text-center text-slate-400 text-sm">Loading…</div></section>';
    }
    return '<section class="relative bg-slate-900 pt-32 pb-14 lg:pt-44 lg:pb-20 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>' +
        '<div class="relative max-w-3xl mx-auto px-6 lg:px-8">' +
        '<span class="reveal-mask inline-block mb-5"><span class="reveal-line roofy-eyebrow inline-flex text-xs font-bold tracking-[0.25em] text-amber-400 uppercase">' + T.footer.legal + '</span></span>' +
        '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"><span class="reveal-mask block"><span class="reveal-line">' + doc.title + '</span></span></h1>' +
        '<div class="reveal-mask"><div class="reveal-line text-xs font-medium tracking-wider uppercase text-amber-400">' + doc.lastUpdated + '</div></div>' +
        '<div class="mt-8 reveal-mask"><p class="reveal-line text-base text-slate-300 leading-relaxed">' + renderInline(doc.intro) + '</p></div>' +
        '</div></section>';
}

function legalSections() {
    const doc = currentLegal();
    if (!doc) return '';
    const items = (doc.sections || []).map(function (sec) {
        const paras = (sec.body || []).map(function (b) {
            return '<p class="text-slate-600 leading-relaxed mb-4">' + renderInline(b) + '</p>';
        }).join('');
        return '<div class="mb-10" data-reveal-up>' +
            '<h2 class="text-xl font-bold text-slate-900 mb-4">' + sec.heading + '</h2>' +
            paras + '</div>';
    }).join('');
    return '<section class="py-16 lg:py-24 bg-white"><div class="max-w-3xl mx-auto px-6 lg:px-8">' + items + '</div></section>';
}

function cookieTableSection() {
    const id = window.ROOFY_PAGE.id;
    if (id !== 'cookies') return '';
    const doc = currentLegal();
    if (!doc || !doc.cookieTable) return '';
    const T = ROOFY.tr();
    const tab = doc.cookieTable;
    return '<section class="pb-16 lg:pb-20 bg-white">' +
        '<div class="max-w-3xl mx-auto px-6 lg:px-8" data-reveal-up>' +
        '<h2 class="text-xl font-bold text-slate-900 mb-5">' + tab.title + '</h2>' +
        '<div class="border border-slate-200 rounded-lg overflow-hidden shadow-sm">' +
        '<div class="grid grid-cols-12 gap-2 bg-slate-900 text-white px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">' +
        '<div class="col-span-4 lg:col-span-3">' + tab.columns.name + '</div>' +
        '<div class="col-span-5 lg:col-span-6">' + tab.columns.purpose + '</div>' +
        '<div class="col-span-3 lg:col-span-2">' + tab.columns.duration + '</div>' +
        '<div class="hidden lg:block lg:col-span-1 text-right">' + tab.columns.category + '</div>' +
        '</div>' +
        tab.rows.map(function (r, i) {
            return '<div class="grid grid-cols-12 gap-2 px-4 py-4 border-t border-slate-100 text-sm ' + (i % 2 ? 'bg-slate-50' : 'bg-white') + '">' +
                '<div class="col-span-4 lg:col-span-3 text-slate-900 font-mono text-[12px]">' + r.name + '</div>' +
                '<div class="col-span-5 lg:col-span-6 text-slate-600">' + r.purpose + '</div>' +
                '<div class="col-span-3 lg:col-span-2 text-slate-500 text-[12px]">' + r.duration + '</div>' +
                '<div class="hidden lg:block lg:col-span-1 text-right text-[10px] font-semibold tracking-wider uppercase text-slate-500">' + r.category + '</div>' +
                '</div>';
        }).join('') +
        '</div>' +
        '<div class="mt-10 p-7 bg-slate-50 border border-slate-100 rounded-lg">' +
        '<div class="text-base font-bold text-slate-900 mb-2">' + T.cookies.manage + '</div>' +
        '<p class="text-sm text-slate-600 leading-relaxed mb-5">' + T.cookies.manageDesc + '</p>' +
        '<button onclick="manageCookies()" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-5 h-10 rounded-sm transition-colors">' +
        '<i data-lucide="refresh-ccw" class="w-4 h-4"></i>' + T.cookies.manage +
        '</button></div>' +
        '</div></section>';
}

function legalContact() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    return '<section class="py-16 lg:py-20 bg-slate-50 border-t border-slate-200">' +
        '<div class="max-w-3xl mx-auto px-6 lg:px-8 text-center" data-reveal-up>' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">' + T.contact.eyebrow + '</div>' +
        '<p class="text-slate-600 leading-relaxed mb-8">' +
        (lang === 'zh' ? '对本文档有疑问？随时和我们对话。' : 'Questions about this document? Get in touch.') +
        '</p>' +
        '<a href="/contact.html" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-6 h-11 rounded-sm transition-colors">' +
        T.cta.contact + '<i data-lucide="arrow-right" class="w-4 h-4"></i></a>' +
        '</div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        legalHero() +
        legalSections() +
        cookieTableSection() +
        legalContact() +
        '</main>' +
        PARTIALS.footerHtml();
};

function loadLegalData() {
    return fetch('/assets/data/legal.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { window.ROOFY_DATA.legal = d; })
        .catch(function () { });
}

window.addEventListener('DOMContentLoaded', function () {
    loadLegalData().then(function () { ROOFY.boot({ page: (window.ROOFY_PAGE && window.ROOFY_PAGE.id) || 'privacy' }); });
});
