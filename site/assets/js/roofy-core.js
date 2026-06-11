/* Roofy Investments Zambia — shared lifecycle core
 * Each page provides window.renderPage() returning the HTML for #root.
 * Each page sets window.ROOFY_PAGE = { id, whatsapp } before calling ROOFY.boot().
 * Language is persisted in localStorage('roofy_lang').
 *
 * 2026-05-14 simplification: removed Three.js particle field, custom cursor,
 * fake brand-intro loader and the Lenis smooth-scroll dependency. The site now
 * leans on native scroll + restrained GSAP reveals for a clean register.
 */
(function () {
    'use strict';

    const STORAGE_LANG = 'roofy_lang';

    /* Preview mode: ?preview=1 means we're inside Sanity Studio's Presentation
     * iframe. Skip scroll-locking animations so visual-editing click overlay works. */
    const PREVIEW = (function () {
        try { return new URLSearchParams(location.search).has('preview'); } catch (_) { return false; }
    })();

    const state = {
        lang: (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_LANG)) || 'en',
        mobileMenuOpen: false,
        propertyFilter: 'all',
        propertyRegion: 'all',
        propertyTransaction: 'all',
        propertyBeds: 'all',
        propertySearch: '',
        newsCategory: 'all',
        page: 'home',
        preview: PREVIEW
    };

    function tr() { return window.I18N[state.lang]; }
    function flipLabel() { return state.lang === 'zh' ? 'EN' : '中'; }

    function initReveals() {
        if (typeof gsap === 'undefined') return;

        /* Respect OS-level reduced motion: show everything, animate nothing. */
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            gsap.set('[data-hero-reveal] .reveal-line', { y: '0%' });
            gsap.set('[data-reveal-up]', { clearProps: 'all', autoAlpha: 1 });
            return;
        }

        gsap.to('[data-hero-reveal] .reveal-line', {
            y: '0%',
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.08,
            delay: 0.05
        });

        if (typeof ScrollTrigger === 'undefined') return;

        /* One orchestrated wave per section instead of dozens of independent
         * pops: group [data-reveal-up] by their closest <section> and reveal
         * each group with a single stagger. Feels intentional, not busy. */
        const groups = new Map();
        gsap.utils.toArray('[data-reveal-up]').forEach(function (el) {
            const key = el.closest('section') || el;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(el);
        });
        groups.forEach(function (els, section) {
            gsap.from(els, {
                y: 18,
                autoAlpha: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.07,
                scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none none' }
            });
        });

        document.querySelectorAll('[data-counter]').forEach(function (el) {
            const target = parseFloat(el.dataset.target || '0');
            const suffix = el.dataset.suffix || '';
            const obj = { v: 0 };
            gsap.to(obj, {
                v: target,
                duration: 1.4,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 85%' },
                onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
            });
        });

        /* Nav scroll-mode swap. On the home page the nav starts in 'hero' mode
         * (transparent over dark hero); scrolling past ~80px flips it to 'solid'.
         * On every other page the nav stays in 'solid' mode regardless. */
        const nav = document.getElementById('site-nav');
        if (nav && state.page === 'home') {
            ScrollTrigger.create({
                start: 80,
                end: 99999,
                onUpdate: function (self) {
                    nav.dataset.mode = self.scroll() > 60 ? 'solid' : 'hero';
                }
            });
        }
    }

    function initPage() {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.getAll().forEach(function (s) { s.kill(); });
        initReveals();
        if (typeof lucide !== 'undefined') lucide.createIcons();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();

        /* Images load after first paint and shift layout, which throws off
         * ScrollTrigger start positions — elements below the fold can get
         * stuck at autoAlpha:0. Recompute once images settle, and as a hard
         * safety net force-reveal any [data-reveal-up] still left hidden. */
        if (typeof ScrollTrigger !== 'undefined' && !initPage._loadBound) {
            initPage._loadBound = true;
            const refresh = function () {
                try { ScrollTrigger.refresh(); } catch (_) { }
                if (typeof gsap !== 'undefined') {
                    document.querySelectorAll('[data-reveal-up]').forEach(function (el) {
                        const cs = window.getComputedStyle(el);
                        if (parseFloat(cs.opacity) < 0.05) gsap.set(el, { autoAlpha: 1, y: 0 });
                    });
                }
            };
            window.addEventListener('load', function () { setTimeout(refresh, 100); });
        }
    }

    function render() {
        document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
        if (typeof window.renderPage !== 'function') return;
        const root = document.getElementById('root');
        if (!root) return;
        root.innerHTML = window.renderPage();
        if (typeof window.PARTIALS !== 'undefined' && typeof window.PARTIALS.applyWhatsapp === 'function') window.PARTIALS.applyWhatsapp();
        if (typeof window.PARTIALS !== 'undefined' && typeof window.PARTIALS.applyCookieBanner === 'function') window.PARTIALS.applyCookieBanner();
        initPage();
    }

    // Actions exposed on window for inline onclick handlers
    window.toggleLang = function () {
        state.lang = state.lang === 'zh' ? 'en' : 'zh';
        try { localStorage.setItem(STORAGE_LANG, state.lang); } catch (_) { }
        render();
    };
    window.toggleMobile = function () { state.mobileMenuOpen = !state.mobileMenuOpen; render(); };
    window.closeMobileMenu = function () { state.mobileMenuOpen = false; render(); };
    window.setFilter = function (f) { state.propertyFilter = f; render(); };
    window.setNewsCategory = function (c) { state.newsCategory = c; render(); };
    window.setPropertyRegion = function (r) { state.propertyRegion = r; render(); };
    window.setPropertyTransaction = function (t) { state.propertyTransaction = t; render(); };
    window.setPropertyBeds = function (b) { state.propertyBeds = b; render(); };
    window.resetPropertyFilters = function () {
        state.propertyFilter = 'all';
        state.propertyRegion = 'all';
        state.propertyTransaction = 'all';
        state.propertyBeds = 'all';
        state.propertySearch = '';
        render();
    };

    /* Search input is special — re-rendering #root on every keystroke would
     * blur the input and reset caret position. Debounce, then re-focus the
     * search input after the next render. */
    let _searchTimer = null;
    window.setPropertySearch = function (v) {
        state.propertySearch = v;
        if (_searchTimer) clearTimeout(_searchTimer);
        _searchTimer = setTimeout(function () {
            render();
            const el = document.getElementById('property-search');
            if (el) {
                el.focus();
                try { el.setSelectionRange(v.length, v.length); } catch (_) { }
            }
        }, 200);
    };

    function boot(opts) {
        opts = opts || {};
        state.page = opts.page || 'home';
        render();
    }

    window.ROOFY = {
        state: state,
        tr: tr,
        flipLabel: flipLabel,
        render: render,
        initPage: initPage,
        boot: boot
    };
})();
