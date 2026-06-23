/*
 * Build-time prerender for the Roofy static site.
 *
 * The public site renders all content client-side (window.renderPage() into
 * #root). Crawlers therefore saw an almost-empty body. This script runs each
 * page's existing render functions in jsdom at build time and bakes the
 * resulting HTML into the static #root, so the full content (nav, services,
 * projects, listings, team, news, footer) is in the HTML for crawlers and
 * no-JS users. The client JS still boots and re-renders on top (the .js class
 * gates the reveal animations, so prerendered content is visible without JS).
 *
 * Usage: node prerender.js   (or npm run prerender / npm run build)
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SITE = path.join(__dirname, 'site');
const ORIGIN = 'https://www.roofyinvestments.com';

/* Static pages with stable content. ?id= detail pages (property/news/project
 * detail) are dynamic per query string and stay client-rendered for now. */
const PAGES = [
    'index.html',
    'about.html',
    'contact.html',
    'services/real-estate.html',
    'services/advertising.html',
    'services/branding.html',
    'properties/index.html',
    'news/index.html',
    'privacy.html',
    'cookies.html',
    'terms.html',
];

/* Vendor / browser-only scripts we skip during replay — the render functions
 * are guarded by typeof checks, so absence is harmless. */
const SKIP_SRC = /(lucide|gsap|ScrollTrigger|swiper|analytics)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function prerenderPage(rel) {
    const file = path.join(SITE, rel);
    const html = fs.readFileSync(file, 'utf8');

    const dom = new JSDOM(html, {
        url: ORIGIN + '/' + rel,
        runScripts: 'outside-only',
        pretendToBeVisual: true,
    });
    const { window } = dom;

    /* Polyfills jsdom lacks. */
    window.matchMedia = function () {
        return { matches: false, media: '', addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } };
    };
    window.fetch = function (url) {
        const p = String(url).split('?')[0].replace(/^https?:\/\/[^/]+/, '');
        const fp = path.join(SITE, p.replace(/^\//, ''));
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(JSON.parse(fs.readFileSync(fp, 'utf8'))),
            text: () => Promise.resolve(fs.readFileSync(fp, 'utf8')),
        });
    };

    /* Replay every classic script in document order, exactly as a browser
     * would, so window.ROOFY_PAGE (inline) and the render functions are set up.
     * Skip non-executable (JSON-LD) and vendor/browser-only scripts. */
    const scripts = [...window.document.querySelectorAll('script')];
    for (const el of scripts) {
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (type && type !== 'text/javascript' && type !== 'application/javascript') continue; // skip ld+json, module
        try {
            if (el.src) {
                const p = el.src.replace(/^https?:\/\/[^/]+/, '');
                if (SKIP_SRC.test(p)) continue;
                window.eval(fs.readFileSync(path.join(SITE, p.replace(/^\//, '')), 'utf8'));
            } else if (el.textContent.trim()) {
                window.eval(el.textContent);
            }
        } catch (e) {
            /* Inline tailwind.config (CDN-era leftover) throws — harmless. */
            if (!/tailwind/.test(el.textContent || '')) console.warn('  ! script error in', rel, '-', e.message);
        }
    }

    /* Clear any prior prerender so we measure a FRESH render (not stale baked
     * content), then kick off the page's data-load + boot. The event must
     * bubble — page modules listen on window.addEventListener('DOMContentLoaded'),
     * and an event dispatched on document only reaches window if it bubbles. */
    const root = window.document.getElementById('root');
    if (root) root.innerHTML = '';
    window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
    for (let i = 0; i < 40 && (!root || !root.innerHTML.trim()); i++) await sleep(25);

    if (!root || !root.innerHTML.trim()) throw new Error('root stayed empty for ' + rel);

    /* Strip JS-only animation state so the baked HTML is the clean rest state. */
    let content = root.innerHTML
        .replace(/\s+is-revealed/g, '')
        .replace(/\s+hero-in/g, '');

    dom.window.close();
    return content;
}

function inject(rel, content) {
    const file = path.join(SITE, rel);
    let html = fs.readFileSync(file, 'utf8');
    /* Idempotent: replace whatever is inside #root (empty or a prior prerender).
     * Anchored on the whatsapp-fab div that always follows root (with or without
     * the optional "Floating UI" comment between them). */
    const re = /<div id="root">[\s\S]*?<\/div>(\s*(?:<!--[\s\S]*?-->\s*)?<div id="whatsapp-fab")/;
    if (!re.test(html)) throw new Error('could not locate #root block in ' + rel);
    html = html.replace(re, '<div id="root">' + content + '</div>$1');
    fs.writeFileSync(file, html);
}

(async function main() {
    let ok = 0;
    for (const rel of PAGES) {
        try {
            const content = await prerenderPage(rel);
            inject(rel, content);
            console.log('  ✓ ' + rel + '  (' + content.length.toLocaleString() + ' chars)');
            ok++;
        } catch (e) {
            console.error('  ✗ ' + rel + '  — ' + e.message);
        }
    }
    console.log('\nPrerendered ' + ok + '/' + PAGES.length + ' pages.');
    if (ok < PAGES.length) process.exit(1);
})();
