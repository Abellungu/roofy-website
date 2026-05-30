/* Cookie-gated GA4 + Meta Pixel loader.
 * Inert by default — fills IDs and analytics activates if `roofy_consent === 'all'`.
 *
 * Wiring:
 *   1. Set GA4_ID and PIXEL_ID below to the production property IDs.
 *   2. <script src="/assets/js/analytics.js" defer></script> is already in every page <head>.
 *   3. User consent flow is handled in partials.js (banner) and emits the `roofy-consent` event.
 *
 * Usage from anywhere:
 *   window.roofyTrack('lead_submit', { source: 'contact_form' });
 *   No-ops unless analytics is live.
 */
(function () {
    'use strict';

    var GA4_ID = '';    // e.g. 'G-XXXXXXXXXX' — client to supply
    var PIXEL_ID = '';  // e.g. '1234567890123456' — client to supply

    function hasConsent() {
        try { return localStorage.getItem('roofy_consent') === 'all'; } catch (_) { return false; }
    }

    function inject() {
        if (window.__roofyAnalyticsLoaded) return;
        if (!hasConsent()) return;
        window.__roofyAnalyticsLoaded = true;

        if (GA4_ID) {
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', GA4_ID, { anonymize_ip: true });
        }

        if (PIXEL_ID) {
            /* eslint-disable */
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
                t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
            }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            /* eslint-enable */
            window.fbq('init', PIXEL_ID);
            window.fbq('track', 'PageView');
        }
    }

    /* Thin no-op-safe tracking helper for future conversion events. */
    window.roofyTrack = function (eventName, params) {
        if (!eventName || !window.__roofyAnalyticsLoaded) return;
        if (window.gtag && GA4_ID) window.gtag('event', eventName, params || {});
        if (window.fbq && PIXEL_ID) window.fbq('trackCustom', eventName, params || {});
    };

    /* Try at load (cached consent), then again when banner accepts. */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
    window.addEventListener('roofy-consent', function (e) {
        if (e && e.detail && e.detail.kind === 'all') inject();
    });
})();
