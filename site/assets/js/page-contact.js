/* Contact page — slate+amber register. Real address/phone/email, hours, map,
 * AJAX form (posts to the self-hosted /admin/contact endpoint), WhatsApp deeplink. */
window.ROOFY_PAGE = { id: 'contact', whatsapp: 'contact' };

const MAILTO = 'roofy@mingyangrt.com';
const WHATSAPP_RAW = '260964813736';
/* Same-origin in production: nginx proxies /admin/ to the admin service, which
 * stores the lead and surfaces it under /admin/leads. */
const CONTACT_ENDPOINT = '/admin/contact';

function contactHero() {
    const T = ROOFY.tr();
    const heroImg = '/assets/img/office/office-boardroom.jpg';
    return '<section id="top" class="hero-cinematic relative min-h-[58vh] flex" style="background-image:url(\'' + heroImg + '\')" data-hero-reveal>' +
        '<div class="relative w-full max-w-[1280px] mx-auto px-6 lg:px-10 flex items-end pt-32 pb-14 lg:pb-20">' +
        '<div class="max-w-3xl">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line text-xs font-semibold tracking-[0.25em] text-amber-400 uppercase">' + T.contact.eyebrow + '</span></span>' +
        '<h1 class="font-display font-medium text-white leading-[0.95] mb-6 text-5xl sm:text-6xl lg:text-7xl"><span class="block reveal-mask"><span class="reveal-line">' + T.contact.title + '</span></span></h1>' +
        '<div class="reveal-mask max-w-2xl"><p class="reveal-line text-lg text-slate-100/85 leading-relaxed">' + T.contact.desc + '</p></div>' +
        '</div></div></section>';
}

function infoTile(label, value, icon, href) {
    const inner = '<div class="flex items-center gap-2 mb-2">' +
        '<i data-lucide="' + icon + '" class="w-4 h-4 text-amber-600"></i>' +
        '<div class="text-xs font-semibold uppercase tracking-wider text-slate-500">' + label + '</div></div>' +
        '<div class="text-sm text-slate-900 leading-relaxed whitespace-pre-line">' + value + '</div>';
    if (href) {
        return '<a href="' + href + '" class="block border-t-2 border-slate-900 pt-5 hover:border-amber-500 transition-colors duration-300">' + inner + '</a>';
    }
    return '<div class="border-t-2 border-slate-900 pt-5">' + inner + '</div>';
}

function contactBlock() {
    const T = ROOFY.tr();
    const why = T.contact.why.items.map(function (s) {
        return '<li class="flex items-start gap-3 text-sm text-slate-700"><i data-lucide="check-circle" class="w-4 h-4 text-amber-500 mt-0.5 shrink-0"></i><span>' + s + '</span></li>';
    }).join('');

    const interestOpts = ['realestate', 'led', 'branding', 'other'].map(function (k) {
        return '<option value="' + k + '">' + T.contact.interest[k] + '</option>';
    }).join('');

    return '<section class="py-16 lg:py-24 bg-slate-50">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">' +
        '<div class="lg:col-span-5 space-y-4" data-reveal-up>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' +
        infoTile(T.contact.address, T.contact.addressV, 'map-pin', 'https://maps.google.com/?q=Ibex+Hill+Lusaka+Zambia') +
        infoTile(T.contact.phone, T.contact.phoneV, 'phone', 'tel:+260964813736') +
        infoTile(T.contact.email, T.contact.emailV, 'mail', 'mailto:' + MAILTO) +
        infoTile(T.contact.hours, T.contact.hoursV1 + '\n' + T.contact.hoursV2 + '\n' + T.contact.hoursV3, 'clock', null) +
        '</div>' +
        '<a href="https://wa.me/' + WHATSAPP_RAW + '?text=' + encodeURIComponent(T.whatsapp.contact) + '" target="_blank" rel="noopener" class="flex items-center justify-between p-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg shadow-sm transition-colors">' +
        '<div><div class="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">WhatsApp</div>' +
        '<div class="font-semibold">' + T.cta.whatsapp + '</div></div>' +
        '<i data-lucide="arrow-up-right" class="w-5 h-5"></i></a>' +
        '<div class="p-6 bg-white border border-slate-100 rounded-lg shadow-sm">' +
        '<div class="text-base font-semibold text-slate-900 mb-4">' + T.contact.why.title + '</div>' +
        '<ul class="space-y-3">' + why + '</ul></div>' +
        '</div>' +
        '<div class="lg:col-span-7">' +
        contactForm(T, interestOpts) +
        '</div></div></section>';
}

function fieldLabel(text) {
    return '<span class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">' + text + '</span>';
}

function contactForm(T, interestOpts) {
    const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-4 h-11 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors';
    return '<form data-reveal-up class="bg-white border border-slate-100 rounded-lg shadow-sm p-7 lg:p-10" id="roofy-contact-form" onsubmit="return submitContact(event)" novalidate>' +
        /* honeypot: hidden from humans, bots tend to fill it; submissions with it set are dropped server-side */
        '<div class="hidden" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">' +
        '<label class="block">' + fieldLabel(T.contact.formName) +
        '<input type="text" name="name" required class="' + inputCls + '" /></label>' +
        '<label class="block">' + fieldLabel(T.contact.formPhone) +
        '<input type="tel" name="phone" class="' + inputCls + '" /></label>' +
        '</div>' +
        '<label class="block mb-5">' + fieldLabel(T.contact.formEmail) +
        '<input type="email" name="email" required class="' + inputCls + '" /></label>' +
        '<label class="block mb-5">' + fieldLabel(T.contact.formInterest) +
        '<select name="interest" class="' + inputCls + ' appearance-none">' + interestOpts + '</select></label>' +
        '<label class="block mb-8">' + fieldLabel(T.contact.formMessage) +
        '<textarea name="message" rows="4" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors resize-none"></textarea></label>' +
        '<button type="submit" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm px-7 h-12 rounded-sm transition-colors shadow-sm">' +
        '<span data-btn-label>' + T.cta.send + '</span><i data-lucide="arrow-right" class="w-4 h-4"></i></button>' +
        '<p data-form-status class="text-sm mt-5" role="status" aria-live="polite"></p>' +
        '<p class="text-xs text-slate-500 mt-3">' + T.contact.formNote + '</p>' +
        '</form>';
}

window.submitContact = function (e) {
    e.preventDefault();
    const f = e.target;
    const T = ROOFY.tr();
    const status = f.querySelector('[data-form-status]');
    const btn = f.querySelector('button[type="submit"]');
    const btnLabel = f.querySelector('[data-btn-label]');

    function setStatus(kind, text) {
        if (!status) return;
        status.className = 'text-sm mt-5 ' + (kind === 'error' ? 'text-red-600' : 'text-slate-500');
        status.textContent = text || '';
    }

    const d = new FormData(f);
    const name = String(d.get('name') || '').trim();
    const email = String(d.get('email') || '').trim();
    const message = String(d.get('message') || '').trim();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
        setStatus('error', T.contact.formErrFields);
        return false;
    }

    const payload = {
        name: name, email: email,
        phone: String(d.get('phone') || '').trim(),
        interest: String(d.get('interest') || 'other'),
        message: message,
        website: String(d.get('website') || ''),   // honeypot
        lang: ROOFY.state.lang
    };

    btn.disabled = true;
    const restore = btnLabel ? btnLabel.textContent : '';
    if (btnLabel) btnLabel.textContent = T.contact.formSending;
    setStatus('ok', '');

    fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(function (r) {
        return r.json().then(function (j) { return { status: r.status, body: j }; })
            .catch(function () { return { status: r.status, body: { ok: r.ok } }; });
    }).then(function (res) {
        if (res.body && res.body.ok) {
            const wrap = f.parentNode;
            wrap.innerHTML = '<div class="bg-white border border-slate-100 rounded-lg shadow-sm p-7 lg:p-10 text-center" data-reveal-up>' +
                '<div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-leaf-50 mb-5"><i data-lucide="check" class="w-7 h-7 text-leaf-600"></i></div>' +
                '<div class="text-xl font-semibold text-slate-900 mb-2">' + T.contact.formOkTitle + '</div>' +
                '<p class="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">' + T.contact.formOkBody + '</p></div>';
            if (window.lucide) lucide.createIcons();
            return;
        }
        btn.disabled = false;
        if (btnLabel) btnLabel.textContent = restore;
        setStatus('error', (res.status === 429) ? T.contact.formErrRate : T.contact.formErr);
    }).catch(function () {
        btn.disabled = false;
        if (btnLabel) btnLabel.textContent = restore;
        setStatus('error', T.contact.formErr);
    });
    return false;
};

function mapSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    return '<section class="py-16 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">' +
        '<div>' +
        '<div class="roofy-eyebrow text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.contact.mapTitle + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-semibold text-slate-900" data-reveal-up>' + T.contact.mapHint + '</h2></div>' +
        '<a href="https://maps.google.com/?q=Ibex+Hill+Lusaka+Zambia" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        (lang === 'zh' ? '在 Google 地图打开' : 'Open in Google Maps') +
        '<i data-lucide="arrow-up-right" class="w-4 h-4"></i></a></div>' +
        '<div class="aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" data-reveal-up>' +
        '<iframe title="ROOFY Lusaka office map" src="https://maps.google.com/maps?q=Ibex%20Hill%20Lusaka%20Zambia&z=14&output=embed" class="w-full h-full" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
        '</div></div></section>';
}

window.renderPage = function () {
    return PARTIALS.navHtml() +
        '<main>' +
        contactHero() +
        contactBlock() +
        mapSection() +
        '</main>' +
        PARTIALS.footerHtml();
};

window.addEventListener('DOMContentLoaded', function () { ROOFY.boot({ page: 'contact' }); });
