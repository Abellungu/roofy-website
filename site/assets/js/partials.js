/* Roofy Investments Zambia - shared HTML partials
 * Exposes window.PARTIALS with nav/footer/whatsappFab/cookieBanner.
 * Paths are absolute from the site root (/about.html, /services/..., etc.).
 */
(function () {
    'use strict';

    const STORAGE_CONSENT = 'roofy_consent';
    /* Editable in the admin panel (settings.js); hardcoded fallback keeps the
     * site working even if settings.js fails to load. */
    const SETTINGS = window.ROOFY_SETTINGS || {};
    const PHONE_RAW = SETTINGS.whatsapp || '260964813736';

    function topLinks(T) {
        return [
            ['home', '/index.html', T.nav.home],
            ['news', '/news/index.html', T.nav.news],
            ['about', '/about.html', T.nav.about],
            ['real-estate', '/services/real-estate.html', T.nav.realEstate],
            ['advertising', '/services/advertising.html', T.nav.advertising],
            ['branding', '/services/branding.html', T.nav.branding],
            ['contact', '/contact.html', T.nav.contact]
        ];
    }

    function navHtml() {
        const T = window.ROOFY.tr();
        const state = window.ROOFY.state;
        const links = topLinks(T);
        /* Nav visual mode: 'hero' when on home page at top (over dark hero image),
         * 'solid' otherwise (white bg + dark text). Toggled by scroll watcher
         * in roofy-core.js's initReveals. Styling lives in roofy.css under
         * [#site-nav[data-mode='hero']] and [#site-nav[data-mode='solid']]. */
        const initialMode = state.page === 'home' ? 'hero' : 'solid';

        const desktop = links.map(function (l) {
            const active = state.page === l[0];
            return '<a href="' + l[1] + '" class="nav-link text-sm font-medium transition-colors' +
                (active ? ' is-active' : '') + '">' + l[2] + '</a>';
        }).join('');

        const mobile = links.map(function (l) {
            return '<a href="' + l[1] + '" onclick="closeMobileMenu()" class="flex items-center justify-between py-4 px-6 border-b border-slate-200 text-slate-800 text-lg">' +
                '<span>' + l[2] + '</span>' +
                '<i data-lucide="arrow-up-right" class="w-4 h-4 text-slate-900"></i>' +
                '</a>';
        }).join('');

        return '\n        <header id="site-nav" data-mode="' + initialMode + '" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">' +
            '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">' +
            '<a href="/index.html" class="nav-wordmark text-2xl font-bold tracking-tight">Roo<span class="text-amber-500">fy</span></a>' +
            '<nav class="hidden lg:flex items-center gap-8">' + desktop + '</nav>' +
            '<div class="flex items-center gap-2">' +
            '<button onclick="toggleLang()" class="nav-lang hidden md:inline-flex items-center text-xs font-medium transition-colors px-3 h-9 rounded-md">' +
            window.ROOFY.flipLabel() +
            '</button>' +
            '<a href="/contact.html" class="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 h-9 rounded-md transition-colors shadow-sm">' +
            T.cta.contact +
            '</a>' +
            '<button onclick="toggleMobile()" class="nav-mobile-toggle lg:hidden p-1" aria-label="Menu">' +
            '<i data-lucide="' + (state.mobileMenuOpen ? 'x' : 'menu') + '" class="w-6 h-6"></i></button>' +
            '</div></div>' +
            (state.mobileMenuOpen ?
                '<div class="lg:hidden bg-white border-t border-slate-200 absolute top-full left-0 right-0 max-h-[80vh] overflow-y-auto shadow-xl">' +
                mobile +
                '<div class="p-6 flex items-center gap-3">' +
                '<button onclick="toggleLang()" class="flex-1 py-3 border border-slate-200 rounded-lg text-slate-800 font-medium">' + (window.ROOFY.state.lang === 'zh' ? 'English' : '中文') + '</button>' +
                '<a href="/contact.html" onclick="closeMobileMenu()" class="flex-1 text-center py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-semibold">' + T.cta.contact + '</a>' +
                '</div></div>' : '') +
            '</header>';
    }

    function footerHtml() {
        const T = window.ROOFY.tr();
        /* Footer also lists the properties index — it lives under the
         * real-estate pillar in the top nav (client direction) but stays
         * one click away down here. */
        const nav = topLinks(T).filter(function (l) { return l[0] !== 'home'; }).concat([
            ['properties', '/properties/index.html', T.nav.properties]
        ]).map(function (l) {
            return '<li><a href="' + l[1] + '" class="text-slate-400 hover:text-amber-500 transition-colors text-sm">' + l[2] + '</a></li>';
        }).join('');
        const services = T.services.items.map(function (s) {
            return '<li><a href="/' + s.href + '" class="text-slate-400 hover:text-amber-500 transition-colors text-sm">' + s.title + '</a></li>';
        }).join('');
        const legal = [
            ['/privacy.html', T.footer.privacy],
            ['/cookies.html', T.footer.cookies],
            ['/terms.html', T.footer.terms]
        ].map(function (l) {
            return '<li><a href="' + l[0] + '" class="text-slate-400 hover:text-amber-500 transition-colors text-sm">' + l[1] + '</a></li>';
        }).join('');

        return '<footer class="bg-slate-950 pt-16 pb-10 border-t border-slate-800">' +
            '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
            '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">' +
            '<div class="lg:col-span-5">' +
            '<a href="/index.html" class="text-2xl font-bold tracking-tight text-white mb-5 inline-block">Roo<span class="text-amber-500">fy</span></a>' +
            '<p class="text-sm text-slate-400 max-w-sm leading-relaxed mb-3">' + T.footer.desc + '</p>' +
            '<p class="text-sm text-amber-500 font-medium mb-8">' + T.footer.sloganLine + '</p>' +
            '<div class="flex items-center gap-3">' +
            (function () {
                const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"';
                const brands = [
                    ['instagram', '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>'],
                    ['facebook', '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'],
                    ['linkedin', '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>'],
                    ['youtube', '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>']
                ];
                const soc = SETTINGS.social || {};
                return brands.filter(function (b) { return soc[b[0]]; }).map(function (b) {
                    return '<a href="' + soc[b[0]] + '" target="_blank" rel="noopener" aria-label="' + b[0] + '" class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500 flex items-center justify-center transition-colors">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" ' + SVG_ATTRS + '>' + b[1] + '</svg></a>';
                }).join('');
            })() +
            '</div></div>' +
            '<div class="lg:col-span-3">' +
            '<div class="text-xs tracking-wider uppercase text-white font-semibold mb-5">' + T.footer.explore + '</div>' +
            '<ul class="space-y-3">' + nav + '</ul></div>' +
            '<div class="lg:col-span-2">' +
            '<div class="text-xs tracking-wider uppercase text-white font-semibold mb-5">' + T.footer.services + '</div>' +
            '<ul class="space-y-3">' + services + '</ul></div>' +
            '<div class="lg:col-span-2">' +
            '<div class="text-xs tracking-wider uppercase text-white font-semibold mb-5">' + T.footer.legal + '</div>' +
            '<ul class="space-y-3">' + legal + '</ul></div>' +
            '</div>' +
            '<div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-500">' +
            '<div>' + T.footer.rights + '</div>' +
            '<div>' + T.contact.addressV + '</div>' +
            '</div></div></footer>';
    }

    function applyWhatsapp() {
        const fab = document.getElementById('whatsapp-fab');
        if (!fab) return;
        const T = window.ROOFY.tr();
        const pageKey = (window.ROOFY_PAGE && window.ROOFY_PAGE.whatsapp) || 'home';
        const msg = T.whatsapp[pageKey] || T.whatsapp.home;
        const href = 'https://wa.me/' + PHONE_RAW + '?text=' + encodeURIComponent(msg);
        fab.innerHTML =
            '<a href="' + href + '" target="_blank" rel="noopener" aria-label="' + T.whatsapp.label + '">' +
            '<i data-lucide="message-circle" class="w-7 h-7"></i></a>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function applyCookieBanner() {
        const el = document.getElementById('cookie-banner');
        if (!el) return;
        let stored = null;
        try { stored = localStorage.getItem(STORAGE_CONSENT); } catch (_) { }
        if (stored) { el.classList.remove('is-visible'); el.innerHTML = ''; return; }
        const T = window.ROOFY.tr();
        el.innerHTML =
            '<div class="bg-white/95 backdrop-blur-md border border-slate-200 rounded-sm p-5 lg:p-6 shadow-2xl">' +
            '<div class="flex items-start gap-3 mb-4"><i data-lucide="cookie" class="w-5 h-5 text-slate-900 mt-0.5 shrink-0"></i>' +
            '<div><div class="text-slate-900 text-sm font-medium mb-1">' + T.cookies.title + '</div>' +
            '<div class="text-slate-500 text-xs leading-relaxed">' + T.cookies.desc + '</div></div></div>' +
            '<div class="flex items-center gap-2 flex-wrap">' +
            '<button onclick="setCookieConsent(\'all\')" class="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 h-9 rounded-md transition-colors">' + T.cookies.accept + '</button>' +
            '<button onclick="setCookieConsent(\'essential\')" class="text-xs font-medium border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-slate-700 px-4 h-9 rounded-md transition-colors">' + T.cookies.reject + '</button>' +
            '<a href="/cookies.html" class="text-xs text-slate-500 hover:text-slate-900 px-2 h-9 inline-flex items-center transition-colors">' + T.cookies.settings + '</a>' +
            '</div></div>';
        setTimeout(function () { el.classList.add('is-visible'); }, 1200);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    window.setCookieConsent = function (kind) {
        try { localStorage.setItem(STORAGE_CONSENT, kind); } catch (_) { }
        const el = document.getElementById('cookie-banner');
        if (el) { el.classList.remove('is-visible'); setTimeout(function () { el.innerHTML = ''; }, 600); }
        window.dispatchEvent(new CustomEvent('roofy-consent', { detail: { kind: kind } }));
    };

    /* Used by /cookies.html: clears the saved consent so the banner reappears. */
    window.manageCookies = function () {
        try { localStorage.removeItem(STORAGE_CONSENT); } catch (_) { }
        window.dispatchEvent(new CustomEvent('roofy-consent', { detail: { kind: null } }));
        location.reload();
    };

    window.PARTIALS = {
        navHtml: navHtml,
        footerHtml: footerHtml,
        applyWhatsapp: applyWhatsapp,
        applyCookieBanner: applyCookieBanner
    };
})();
