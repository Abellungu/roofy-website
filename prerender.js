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

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Render a page's #root in jsdom. `urlOverride` lets ?id= detail pages render a
 * specific record (the page JS reads location.search). Returns the baked HTML. */
async function prerenderPage(rel, urlOverride) {
    const file = path.join(SITE, rel);
    const html = fs.readFileSync(file, 'utf8');

    const dom = new JSDOM(html, {
        url: urlOverride || (ORIGIN + '/' + rel),
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

/* Generate one static, SEO-clean HTML file per REAL project (placeholder:false).
 * Source template is projects/detail.html; we render its #root with ?id=<slug>,
 * rewrite the per-project head tags, bake in window.ROOFY_PROJECT_ID so the live
 * page (served without a query string) re-renders the right record, and write
 * /projects/<slug>.html. These clean URLs go in the sitemap; the legacy
 * /projects/detail.html?id= keeps working for old links. */
async function generateProjectPages() {
    const data = JSON.parse(fs.readFileSync(path.join(SITE, 'assets/data/projects.json'), 'utf8'));
    const projects = (data.projects || []).filter((p) => !p.placeholder);
    const tpl = fs.readFileSync(path.join(SITE, 'projects/detail.html'), 'utf8');
    const reRoot = /<div id="root">[\s\S]*?<\/div>(\s*(?:<!--[\s\S]*?-->\s*)?<div id="whatsapp-fab")/;
    const slugs = [];
    for (const p of projects) {
        const slug = p.id;
        const content = await prerenderPage('projects/detail.html', ORIGIN + '/projects/detail.html?id=' + encodeURIComponent(slug));
        const name = p.nameEn || p.nameZh || 'Project';
        const desc = (p.taglineEn || p.taglineZh || 'A flagship project developed by the Roofy parent group.');
        const cleanUrl = ORIGIN + '/projects/' + slug + '.html';
        const ogImg = ORIGIN + (p.heroImg || '/assets/img/logo.jpg');

        let out = tpl
            .replace(
                "<script>document.documentElement.classList.add('js');</script>",
                "<script>document.documentElement.classList.add('js');</script>\n    <script>window.ROOFY_PROJECT_ID=" + JSON.stringify(slug) + ";</script>"
            )
            .replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHtml(name) + ' — Roofy Projects</title>')
            .replace('content="A flagship project developed by the Roofy parent group."', 'content="' + escapeHtml(desc) + '"')
            .split('https://www.roofyinvestments.com/projects/detail.html').join(cleanUrl)
            .replace('content="Roofy Project"', 'content="' + escapeHtml(name) + '"')
            .replace('content="https://www.roofyinvestments.com/assets/img/logo.jpg"', 'content="' + ogImg + '"');

        if (!reRoot.test(out)) throw new Error('could not locate #root block in project ' + slug);
        out = out.replace(reRoot, '<div id="root">' + content + '</div>$1');
        fs.writeFileSync(path.join(SITE, 'projects/' + slug + '.html'), out);
        console.log('  ✓ projects/' + slug + '.html  (' + content.length.toLocaleString() + ' chars)');
        slugs.push(slug);
    }
    return slugs;
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

    let projOk = 0;
    try {
        const slugs = await generateProjectPages();
        projOk = slugs.length;
    } catch (e) {
        console.error('  ✗ project pages — ' + e.message);
    }

    console.log('\nPrerendered ' + ok + '/' + PAGES.length + ' static pages + ' + projOk + ' project pages.');
    if (ok < PAGES.length) process.exit(1);
})();
