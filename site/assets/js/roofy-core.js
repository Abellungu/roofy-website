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
        /* First visit: follow the browser language (zh → 中文, anything else →
         * English). A manual toggle persists to localStorage and always wins. */
        lang: (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_LANG)) ||
            (/^zh/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'zh' : 'en'),
        mobileMenuOpen: false,
        propertyFilter: 'all',
        propertyRegion: 'all',
        propertyTransaction: 'all',
        propertyBeds: 'all',
        propertySort: 'default',
        propertySearch: '',
        newsCategory: 'all',
        page: 'home',
        preview: PREVIEW
    };

    function tr() { return window.I18N[state.lang]; }
    function flipLabel() { return state.lang === 'zh' ? 'EN' : '中'; }

    /* Scroll reveals run on a live getBoundingClientRect scanner driven by
     * scroll/resize, NOT ScrollTrigger or IntersectionObserver. ScrollTrigger
     * cached start positions before lazy images + the Swiper loaded, so
     * below-fold sections stayed stuck at opacity:0 (the "blank lower half"
     * bug). IntersectionObserver doesn't fire on this page at all — body has
     * overflow-x:hidden, which makes it a scroll container and breaks IO's
     * default-viewport root. getBoundingClientRect is viewport-relative and
     * read live every scan, so it is immune to both problems. */
    let _revealCleanup = null;

    function runCounter(el) {
        const target = parseFloat(el.dataset.target || '0');
        const suffix = el.dataset.suffix || '';
        if (typeof gsap !== 'undefined') {
            const obj = { v: 0 };
            gsap.to(obj, { v: target, duration: 1.4, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; } });
        } else {
            el.textContent = target + suffix;
        }
    }

    function revealEl(el) {
        if (el._revealed) return;
        el._revealed = true;
        if (el.hasAttribute('data-counter')) runCounter(el);
        else el.classList.add('is-revealed');
    }

    /* All elements that crossed the trigger line in ONE scan tick animate as a
     * single compressed GSAP wave (stagger.amount, not per-element delays) —
     * the fixed 70ms-per-item CSS queue read as lag. Without GSAP, the
     * .is-revealed class from revealEl() shows them instantly. */
    function animateBatch(els) {
        const batch = els.filter(function (el) { return !el.hasAttribute('data-counter'); });
        if (!batch.length || typeof gsap === 'undefined') return;
        gsap.fromTo(batch,
            { y: 26, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out',
                stagger: { amount: Math.min(0.24, batch.length * 0.06) },
                overwrite: 'auto'
            });
    }

    function initReveals() {
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* Hero headline lines slide up via a CSS class toggle (deterministic —
         * gsap left wrapped headline lines partially behind the reveal-mask on
         * this page). Stagger via per-line --reveal-delay. */
        const heroLines = document.querySelectorAll('[data-hero-reveal] .reveal-line');
        heroLines.forEach(function (el, i) { el.style.setProperty('--reveal-delay', (reduceMotion ? 0 : 50 + i * 90) + 'ms'); });
        const heroEls = document.querySelectorAll('[data-hero-reveal]');
        if (reduceMotion) {
            heroEls.forEach(function (h) { h.classList.add('hero-in'); });
        } else {
            requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (h) { h.classList.add('hero-in'); }); }); });
        }

        /* Tear down the previous page's scanner (language re-render rebuilds #root). */
        if (_revealCleanup) { _revealCleanup(); _revealCleanup = null; }

        let targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-up], [data-counter]'));
        targets.forEach(function (el) { el._revealed = false; });

        /* Reduced motion: show everything at once, no animation. */
        if (reduceMotion) {
            targets.forEach(revealEl);
            return;
        }

        let ticking = false;
        function scan() {
            ticking = false;
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const newly = [];
            targets = targets.filter(function (el) {
                /* Reveal once the element's top has crossed the trigger line —
                 * NOT gated on still being in view, so a fast scroll/fling that
                 * skips a section past the top still reveals it (no stuck gaps). */
                if (el.getBoundingClientRect().top < vh * 0.9) { revealEl(el); newly.push(el); return false; }
                return true;
            });
            animateBatch(newly);
            if (!targets.length) cleanup();
        }
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(scan);
        }
        function cleanup() {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            _revealCleanup = null;
        }
        _revealCleanup = cleanup;

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        /* Initial pass for above-the-fold, plus delayed passes to catch lazy
         * images / Swiper reflowing content into view without a scroll event. */
        scan();
        setTimeout(scan, 300);
        setTimeout(scan, 900);
        window.addEventListener('load', function () { setTimeout(scan, 50); }, { once: true });
    }

    /* Nav runs transparent over a cinematic full-image hero and turns solid
     * past it; pages without such a hero keep the solid bar. Generalised here so
     * any page whose #top has .hero-cinematic gets the behaviour. */
    let _navModeHandler = null;
    function initNavMode() {
        const nav = document.getElementById('site-nav');
        const hero = document.getElementById('top');
        if (_navModeHandler) { window.removeEventListener('scroll', _navModeHandler); _navModeHandler = null; }
        if (!nav) return;
        if (!hero || !hero.classList.contains('hero-cinematic')) { nav.setAttribute('data-mode', 'solid'); return; }
        const update = function () {
            /* Math.max guards the first run before the hero has laid out
               (offsetHeight 0); rAF re-runs once layout settles. */
            nav.setAttribute('data-mode', window.scrollY > Math.max(160, hero.offsetHeight - 80) ? 'solid' : 'hero');
        };
        update();
        requestAnimationFrame(update);
        _navModeHandler = update;
        window.addEventListener('scroll', update, { passive: true });
    }

    function initPage() {
        initReveals();
        initNavMode();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function render() {
        document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
        if (typeof window.renderPage !== 'function') return;
        const root = document.getElementById('root');
        if (!root) return;
        root.innerHTML = window.renderPage();
        if (typeof window.PARTIALS !== 'undefined' && typeof window.PARTIALS.applyWhatsapp === 'function') window.PARTIALS.applyWhatsapp();
        if (typeof window.PARTIALS !== 'undefined' && typeof window.PARTIALS.applyCookieBanner === 'function') window.PARTIALS.applyCookieBanner();
        document.body.classList.toggle('menu-open', state.mobileMenuOpen);
        initPage();
        /* Optional per-page post-render hook (e.g. (re)initialising a Swiper
         * carousel after #root is rebuilt). Defined by the page module if needed. */
        if (typeof window.onRoofyRender === 'function') { try { window.onRoofyRender(); } catch (_) { } }
    }

    // Actions exposed on window for inline onclick handlers
    window.toggleLang = function () {
        state.lang = state.lang === 'zh' ? 'en' : 'zh';
        try { localStorage.setItem(STORAGE_LANG, state.lang); } catch (_) { }
        render();
    };
    /* Mobile menu toggles by repainting ONLY the nav bar, not the whole page.
     * A full render() here rebuilt #root (hero image, every section, Swiper,
     * ScrollTrigger) just to show a menu — on phones that was slow enough that a
     * tap felt dead, the user tapped again, and the second tap toggled it shut
     * ("menu doesn't appear"). Repainting just #site-nav is instant. */
    function renderNavOnly() {
        const old = document.getElementById('site-nav');
        if (!old || !window.PARTIALS || typeof window.PARTIALS.navHtml !== 'function') { render(); return; }
        old.outerHTML = window.PARTIALS.navHtml().trim();
        if (typeof lucide !== 'undefined') lucide.createIcons();
        initNavMode();
        /* Floating UI (WhatsApp FAB, cookie banner) yields while the menu is
         * open — it otherwise overlaps the menu's own bottom CTA bar. */
        document.body.classList.toggle('menu-open', state.mobileMenuOpen);
        /* Menu entrance: one fluid GSAP wave (panel + rows overlap into a
         * single motion) instead of a row-by-row CSS queue, which read as
         * jank. stagger.amount spreads the whole cascade over 0.22s no
         * matter how many rows there are. */
        if (state.mobileMenuOpen && typeof gsap !== 'undefined' &&
            !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from('.mobile-menu', { autoAlpha: 0, y: -14, duration: 0.3 }, 0)
                .from('.mobile-menu .mm-item', {
                    y: 22, autoAlpha: 0, duration: 0.5,
                    stagger: { amount: 0.22 },
                    clearProps: 'transform,opacity,visibility'
                }, 0.05);
        }
    }
    window.toggleMobile = function () { state.mobileMenuOpen = !state.mobileMenuOpen; renderNavOnly(); };
    window.closeMobileMenu = function () { if (!state.mobileMenuOpen) return; state.mobileMenuOpen = false; renderNavOnly(); };
    window.setFilter = function (f) { state.propertyFilter = f; render(); };
    window.setNewsCategory = function (c) { state.newsCategory = c; render(); };
    window.setPropertyRegion = function (r) { state.propertyRegion = r; render(); };
    window.setPropertyTransaction = function (t) { state.propertyTransaction = t; render(); };
    window.setPropertyBeds = function (b) { state.propertyBeds = b; render(); };
    window.setPropertySort = function (s) { state.propertySort = s; render(); };
    window.resetPropertyFilters = function () {
        state.propertyFilter = 'all';
        state.propertyRegion = 'all';
        state.propertyTransaction = 'all';
        state.propertyBeds = 'all';
        state.propertySort = 'default';
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
