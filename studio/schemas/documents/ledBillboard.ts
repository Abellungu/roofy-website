import {defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

/* A ROOFY-operated outdoor LED billboard location, offered to advertisers.
 * Surfaces in the billboard inventory table on /services/advertising.html.
 * "now booking founding partners" framing — availability + rate card filled
 * in as inventory comes online (per brand-voice rules: emerging, not mature). */
export default defineType({
    name: 'ledBillboard',
    title: 'LED billboard (outdoor location)',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({type: 'ledBillboard'}),
        {
            name: 'code',
            title: 'Location code (e.g. LSK-01)',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'name',
            title: 'Location name',
            type: 'bilingualString',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'address',
            title: 'Address / 详细地址',
            type: 'bilingualString',
        },
        {
            name: 'screenSize',
            title: 'Screen size / 屏幕尺寸 (e.g. 12m × 6m)',
            type: 'string',
        },
        {
            name: 'dailyTraffic',
            title: 'Daily traffic / 日均车流人流 (e.g. 45,000+ /day)',
            type: 'string',
        },
        {
            name: 'availability',
            title: 'Availability',
            type: 'string',
            options: {
                list: [
                    {title: '招商中 · Now booking', value: 'booking'},
                    {title: '即将上线 · Coming online', value: 'coming'},
                    {title: '已满租 · Fully booked', value: 'booked'},
                ],
                layout: 'radio',
            },
            initialValue: 'coming',
        },
        {
            name: 'placeholder',
            title: 'Placeholder / sample',
            type: 'boolean',
            initialValue: true,
            description: 'Defaults to true — turn off only when the location & rate are confirmed.',
        },
        {
            name: 'monthlyRate',
            title: 'Monthly rate (leave blank for "招商中 / On request")',
            type: 'string',
            description: 'Free-form, e.g. "USD 3,500 / month". Blank renders as 招商中.',
        },
        {
            name: 'image',
            title: 'Location photo',
            type: 'image',
            options: {hotspot: true},
        },
        {
            name: 'mapUrl',
            title: 'Google Maps URL',
            type: 'url',
        },
    ],
    preview: {
        select: {code: 'code', nameEn: 'name.en', nameZh: 'name.zh', availability: 'availability', media: 'image', placeholder: 'placeholder'},
        prepare(sel: any) {
            const availLabel = {booking: '招商中', coming: '即将上线', booked: '已满租'}[sel.availability as string] || sel.availability
            return {
                title: [sel.code, sel.nameEn || sel.nameZh].filter(Boolean).join(' · ') || '(Untitled)',
                subtitle: availLabel + (sel.placeholder ? ' · 示例' : ''),
                media: sel.media,
            }
        },
    },
})
