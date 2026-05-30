import {defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

/* A China-sourced LED screen product, available for sale and/or rental.
 * Surfaces in the LED sales/rental table on /services/advertising.html.
 * Prices intentionally optional — the client will supply a sale price and a
 * rental price per product later (see "等附件" note in project memory). */
export default defineType({
    name: 'ledProduct',
    title: 'LED product (sale / rental)',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({type: 'ledProduct'}),
        {
            name: 'model',
            title: 'Model / 型号 (e.g. P2.5 Indoor, P4 Outdoor)',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'name',
            title: 'Display name',
            type: 'bilingualString',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'usage',
            title: 'Usage',
            type: 'string',
            options: {
                list: [
                    {title: '室内 · Indoor', value: 'indoor'},
                    {title: '室外 · Outdoor', value: 'outdoor'},
                    {title: '租赁屏 · Rental panel', value: 'rental'},
                ],
                layout: 'radio',
            },
            initialValue: 'indoor',
        },
        {
            name: 'pixelPitch',
            title: 'Pixel pitch / 点间距 (e.g. P2.5, P4, P10)',
            type: 'string',
        },
        {
            name: 'brightness',
            title: 'Brightness / 亮度 (e.g. 800 nits, 5500 nits)',
            type: 'string',
        },
        {
            name: 'cabinetSize',
            title: 'Cabinet size / 箱体尺寸 (e.g. 640×480 mm)',
            type: 'string',
        },
        {
            name: 'placeholder',
            title: 'Placeholder / sample',
            type: 'boolean',
            initialValue: true,
            description: 'Defaults to true — turn off only when the product spec & pricing are confirmed.',
        },
        {
            name: 'salePrice',
            title: 'Sale price (leave blank for "面议 / On request")',
            type: 'string',
            description: 'Free-form, e.g. "USD 1,200 / m²". Blank renders as 面议.',
        },
        {
            name: 'rentalPrice',
            title: 'Rental price (leave blank for "面议 / On request")',
            type: 'string',
            description: 'Free-form, e.g. "USD 80 / m² / day". Blank renders as 面议.',
        },
        {
            name: 'image',
            title: 'Product image',
            type: 'image',
            options: {hotspot: true},
        },
        {
            name: 'note',
            title: 'Note / 备注',
            type: 'bilingualString',
        },
    ],
    preview: {
        select: {model: 'model', nameEn: 'name.en', nameZh: 'name.zh', usage: 'usage', media: 'image', placeholder: 'placeholder'},
        prepare(sel: any) {
            const usageLabel = {indoor: '室内', outdoor: '室外', rental: '租赁'}[sel.usage as string] || sel.usage
            return {
                title: [sel.model, sel.nameEn || sel.nameZh].filter(Boolean).join(' · ') || '(Untitled)',
                subtitle: usageLabel + (sel.placeholder ? ' · 示例' : ''),
                media: sel.media,
            }
        },
    },
})
