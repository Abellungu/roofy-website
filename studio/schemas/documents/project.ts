import {defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

/* A group-developed flagship project (e.g. 皇冠, 奇迹, 静居, 荣耀).
 * Distinct from `property` (single listing): a project is a whole
 * development with marketing copy, hero, gallery, status, etc. — the
 * brand showcase. Surfaces on /properties/index.html as a featured
 * band at the top, and at /projects/detail.html?id=<slug>. */
export default defineType({
    name: 'project',
    title: 'Project (group development)',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({type: 'project'}),
        {
            name: 'slug',
            title: 'Slug (URL id)',
            type: 'slug',
            options: {source: (doc: any) => doc?.name?.en || doc?.name?.zh || 'untitled-project', maxLength: 80},
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'placeholder',
            title: 'Placeholder / sample project',
            type: 'boolean',
            initialValue: false,
            description: 'Mark `true` while content is illustrative. Toggle off when content is approved.',
        },
        {
            name: 'name',
            title: 'Project name',
            type: 'bilingualString',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    {title: '热销中 · Selling', value: 'selling'},
                    {title: '已交付 · Delivered', value: 'delivered'},
                    {title: '建设中 · Under construction', value: 'under-construction'},
                    {title: '即将开盘 · Upcoming', value: 'upcoming'},
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'tagline',
            title: 'Tagline (short marketing line)',
            type: 'bilingualString',
        },
        {
            name: 'location',
            title: 'Location',
            type: 'bilingualString',
        },
        {
            name: 'propertyType',
            title: 'Property type (e.g. 豪华独栋别墅 / Luxury villas)',
            type: 'bilingualString',
        },
        {
            name: 'priceRange',
            title: 'Price range (display string, e.g. "USD 250,000 起")',
            type: 'string',
            description: 'Free-form display string. Leave blank for "Price on request".',
        },
        {
            name: 'totalUnits',
            title: 'Total units',
            type: 'number',
        },
        {
            name: 'developmentArea',
            title: 'Development area (e.g. 约 4 公顷)',
            type: 'bilingualString',
        },
        {
            name: 'launchYear',
            title: 'Launch year',
            type: 'number',
        },
        {
            name: 'expectedDelivery',
            title: 'Expected delivery (e.g. "2027 Q2")',
            type: 'bilingualString',
        },
        {
            name: 'heroImage',
            title: 'Hero image',
            type: 'image',
            options: {hotspot: true},
        },
        {
            name: 'gallery',
            title: 'Gallery (additional images)',
            type: 'array',
            of: [{type: 'image', options: {hotspot: true}}],
            options: {layout: 'grid'},
        },
        {
            name: 'description',
            title: 'Description (long-form marketing copy)',
            type: 'bilingualText',
        },
        {
            name: 'keyFeatures',
            title: 'Key features (bullet points)',
            type: 'array',
            of: [{type: 'bilingualString'}],
        },
    ],
    preview: {
        select: {
            nameZh: 'name.zh',
            nameEn: 'name.en',
            status: 'status',
            location: 'location.en',
            placeholder: 'placeholder',
            media: 'heroImage',
        },
        prepare(sel: any) {
            const statusLabel = {
                selling: '热销中',
                delivered: '已交付',
                'under-construction': '建设中',
                upcoming: '即将开盘',
            }[sel.status as string] || sel.status
            return {
                ...sel,
                title: sel.nameEn || sel.nameZh || '(Untitled)',
                subtitle: [statusLabel, sel.location].filter(Boolean).join(' · ') +
                    (sel.placeholder ? ' · 示例' : ''),
            }
        },
    },
})
