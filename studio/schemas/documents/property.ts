import {defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {PropertyPreview} from '../../components/PropertyPreview'

/* A single property listing. The home page's featured band + the /properties
 * listing + the /properties/detail.html?id=... page all read from this. */
export default defineType({
    name: 'property',
    title: 'Property',
    type: 'document',
    orderings: [orderRankOrdering],
    components: {
        preview: PropertyPreview,
    },
    fields: [
        orderRankField({type: 'property'}),
        {
            name: 'slug',
            title: 'Slug (URL id)',
            type: 'slug',
            options: {source: (doc: any) => doc?.title?.en || doc?.title?.zh || 'untitled', maxLength: 80},
            validation: (Rule) => Rule.required(),
            description: 'Used as ?id= parameter on the detail URL.',
        },
        {
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    {title: 'New', value: 'new'},
                    {title: 'Resale', value: 'resale'},
                    {title: 'Rent', value: 'rent'},
                    {title: 'Land', value: 'land'},
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'transactionType',
            title: 'Transaction type',
            type: 'string',
            options: {
                list: [
                    {title: '出售 · Sale', value: 'sale'},
                    {title: '出租 · Rent', value: 'rent'},
                ],
                layout: 'radio',
            },
            initialValue: 'sale',
            description: 'Sale vs rent. New / Resale / Land default to sale; "Rent" category usually rent.',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'region',
            title: 'Region / 区域',
            type: 'string',
            options: {
                list: [
                    {title: 'Kabulonga', value: 'kabulonga'},
                    {title: 'Ibex Hill', value: 'ibex-hill'},
                    {title: 'Roma', value: 'roma'},
                    {title: 'Olympia', value: 'olympia'},
                    {title: 'Kalundu', value: 'kalundu'},
                    {title: 'Kingsland', value: 'kingsland'},
                    {title: 'Cathedral Hill', value: 'cathedral-hill'},
                    {title: 'Lusaka West', value: 'lusaka-west'},
                    {title: 'Avondale', value: 'avondale'},
                    {title: 'Sunningdale', value: 'sunningdale'},
                    {title: 'Chongwe', value: 'chongwe'},
                    {title: 'Other / 其他', value: 'other'},
                ],
            },
            description: 'Used by the regional filter on /properties.',
        },
        {
            name: 'placeholder',
            title: 'Sample listing (shows "Sample" badge)',
            type: 'boolean',
            initialValue: false,
            description:
                'Mark `true` while content is illustrative. Toggle off only when the listing is real and approved for publication.',
        },
        {
            name: 'image',
            title: 'Hero image',
            type: 'image',
            options: {hotspot: true},
        },
        {name: 'title', title: 'Title', type: 'bilingualString', validation: (Rule) => Rule.required()},
        {name: 'location', title: 'Location', type: 'bilingualString'},
        {name: 'price', title: 'Price', type: 'price', validation: (Rule) => Rule.required()},
        {name: 'area', title: 'Area', type: 'bilingualString'},
        {name: 'beds', title: 'Bedrooms', type: 'number', initialValue: 0},
        {name: 'baths', title: 'Bathrooms', type: 'number', initialValue: 0},
        {name: 'description', title: 'Description', type: 'bilingualText'},
    ],
    preview: {
        select: {
            titleZh: 'title.zh',
            titleEn: 'title.en',
            location: 'location.en',
            priceFormatted: 'price.formatted',
            category: 'category',
            placeholder: 'placeholder',
            media: 'image',
        },
        prepare(sel: any) {
            return {
                ...sel,
                title: sel.titleEn || sel.titleZh || '(Untitled)',
                subtitle: [sel.priceFormatted, sel.location].filter(Boolean).join(' · '),
            }
        },
    },
})
