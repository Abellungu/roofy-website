/* Shared property card markup. Used by home (featured band) and /properties listing.
 * Call: window.propertyCard(property, T) where T = ROOFY.tr().
 *
 * 2026-05-29: surfaces transactionType chip (出售 / 出租) next to type
 * pill and shows region name above the title when present.
 */
(function () {
    'use strict';

    function propertyCard(p, T) {
        const lang = window.ROOFY.state.lang;
        const title = lang === 'zh' ? p.titleZh : p.titleEn;
        const tag = T.featured.filters[p.type];
        const txn = p.transactionType || 'sale';
        const txnLabel = (T.properties && T.properties.chipFor && T.properties.chipFor[txn]) || '';
        const regionLabel = p.region && T.properties && T.properties.regions ? T.properties.regions[p.region] : '';
        return '<a href="/properties/detail.html?id=' + encodeURIComponent(p.id) + '" ' +
            'class="group block bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300" data-reveal-up>' +
            '<div class="img-zoom relative aspect-[5/4] overflow-hidden bg-slate-100">' +
            '<img src="' + p.img + '" data-placeholder="' + (p.placeholder ? 'true' : 'false') + '" alt="' + title + '" loading="lazy" class="w-full h-full object-cover" />' +
            '<div class="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">' +
            '<span class="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-900 px-2 py-0.5 rounded-sm">' + tag + '</span>' +
            (txnLabel ? '<span class="text-[10px] font-bold uppercase tracking-wider ' + (txn === 'rent' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200') + ' px-2 py-0.5 rounded-sm">' + txnLabel + '</span>' : '') +
            (p.placeholder ? '<span class="text-[10px] font-bold uppercase tracking-wider bg-slate-900/70 backdrop-blur text-white px-2 py-0.5 rounded-sm">' + T.featured.sample + '</span>' : '') +
            '</div></div>' +
            '<div class="p-5">' +
            '<div class="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">' +
            '<span class="inline-flex items-center gap-1.5 truncate"><i data-lucide="map-pin" class="w-3 h-3 shrink-0"></i>' + (p.loc || '') + '</span>' +
            (regionLabel ? '<span class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 shrink-0">' + regionLabel + '</span>' : '') +
            '</div>' +
            '<h3 class="text-base font-semibold text-slate-900 mb-3 leading-snug">' + title + '</h3>' +
            '<div class="flex items-end justify-between pt-4 border-t border-slate-100">' +
            '<div><div class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">' + (T.properties && T.properties.detail ? T.properties.detail.priceLabel : 'Price') + '</div>' +
            '<div class="text-amber-600 font-bold">' + p.price + '</div></div>' +
            '<div class="text-right text-xs text-slate-600 space-y-0.5"><div>' + p.area + '</div>' +
            (p.beds > 0 ? '<div>' + p.beds + ' ' + T.featured.bedroom + ' · ' + p.baths + ' ' + T.featured.bathroom + '</div>' : '') +
            '</div></div></div></a>';
    }

    window.propertyCard = propertyCard;
})();
