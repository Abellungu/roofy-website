/* Contact page — slate+amber register. Real address/phone/email, hours, map,
 * mailto form, WhatsApp deeplink. */
window.ROOFY_PAGE = { id: 'contact', whatsapp: 'contact' };

const MAILTO = 'roofy@mingyangrt.com';
const WHATSAPP_RAW = '260964813736';

function contactHero() {
    const T = ROOFY.tr();
    return '<section class="relative bg-slate-900 pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden" data-hero-reveal>' +
        '<div class="absolute inset-0">' +
        '<img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" data-placeholder="true" alt="" class="w-full h-full object-cover opacity-25" />' +
        '<div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-slate-900/60"></div>' +
        '</div>' +
        '<div class="relative max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<span class="reveal-mask inline-block mb-6"><span class="reveal-line inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wider uppercase">' + T.contact.eyebrow + '</span></span>' +
        '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 max-w-4xl"><span class="block reveal-mask"><span class="reveal-line">' + T.contact.title + '</span></span></h1>' +
        '<div class="reveal-mask max-w-2xl"><p class="reveal-line text-base lg:text-lg text-slate-300 leading-relaxed">' + T.contact.desc + '</p></div>' +
        '</div></section>';
}

function infoTile(label, value, icon, href) {
    const inner = '<div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-4"><i data-lucide="' + icon + '" class="w-5 h-5"></i></div>' +
        '<div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">' + label + '</div>' +
        '<div class="text-sm text-slate-900 leading-relaxed whitespace-pre-line">' + value + '</div>';
    if (href) {
        return '<a href="' + href + '" class="block p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">' + inner + '</a>';
    }
    return '<div class="p-5 bg-white border border-slate-100 rounded-xl shadow-sm">' + inner + '</div>';
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
        '<a href="https://wa.me/' + WHATSAPP_RAW + '?text=' + encodeURIComponent(T.whatsapp.contact) + '" target="_blank" rel="noopener" class="flex items-center justify-between p-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-sm transition-colors">' +
        '<div><div class="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">WhatsApp</div>' +
        '<div class="font-semibold">' + T.cta.whatsapp + '</div></div>' +
        '<i data-lucide="arrow-up-right" class="w-5 h-5"></i></a>' +
        '<div class="p-6 bg-white border border-slate-100 rounded-xl shadow-sm">' +
        '<div class="text-base font-bold text-slate-900 mb-4">' + T.contact.why.title + '</div>' +
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
    return '<form data-reveal-up class="bg-white border border-slate-100 rounded-xl shadow-sm p-7 lg:p-10" id="roofy-contact-form" onsubmit="return submitContact(event)">' +
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
        '<button type="submit" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-7 h-12 rounded-md transition-colors shadow-sm">' +
        T.cta.send + '<i data-lucide="arrow-right" class="w-4 h-4"></i></button>' +
        '<p class="text-xs text-slate-500 mt-5">' + (ROOFY.state.lang === 'zh' ? '提交后将通过您的默认邮件客户端发送至 ' : 'Will open your default mail client to send to ') + MAILTO + '。</p>' +
        '</form>';
}

window.submitContact = function (e) {
    e.preventDefault();
    const f = e.target;
    const d = new FormData(f);
    const subject = encodeURIComponent('[ROOFY Inquiry] ' + (d.get('interest') || ''));
    const body = encodeURIComponent(
        'Name: ' + (d.get('name') || '') + '\n' +
        'Email: ' + (d.get('email') || '') + '\n' +
        'Phone: ' + (d.get('phone') || '') + '\n' +
        'Interest: ' + (d.get('interest') || '') + '\n\n' +
        (d.get('message') || '')
    );
    window.location.href = 'mailto:' + MAILTO + '?subject=' + subject + '&body=' + body;
    return false;
};

function mapSection() {
    const T = ROOFY.tr();
    const lang = ROOFY.state.lang;
    return '<section class="py-16 lg:py-24 bg-white">' +
        '<div class="max-w-[1280px] mx-auto px-6 lg:px-10">' +
        '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">' +
        '<div>' +
        '<div class="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3" data-reveal-up>' + T.contact.mapTitle + '</div>' +
        '<h2 class="text-2xl md:text-3xl font-bold text-slate-900" data-reveal-up>' + T.contact.mapHint + '</h2></div>' +
        '<a href="https://maps.google.com/?q=Ibex+Hill+Lusaka+Zambia" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" data-reveal-up>' +
        (lang === 'zh' ? '在 Google 地图打开' : 'Open in Google Maps') +
        '<i data-lucide="arrow-up-right" class="w-4 h-4"></i></a></div>' +
        '<div class="aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" data-reveal-up>' +
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
