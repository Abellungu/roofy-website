import {defineType} from 'sanity'

/* A row inside the Cookies-policy page's cookie table.
 * Name + duration are language-neutral; purpose + category are bilingual. */
export default defineType({
    name: 'cookieRow',
    title: 'Cookie',
    type: 'object',
    fields: [
        {
            name: 'name',
            title: 'Cookie name',
            type: 'string',
            description: 'e.g. roofy_consent, _ga, _fbp, NID',
        },
        {
            name: 'purpose',
            title: 'Purpose',
            type: 'bilingualString',
        },
        {
            name: 'duration',
            title: 'Duration',
            type: 'string',
            description: 'e.g. 12 months / 13 months / Session',
        },
        {
            name: 'category',
            title: 'Category',
            type: 'bilingualString',
            description: 'e.g. Essential / Analytics / Advertising / Third-party',
        },
    ],
    preview: {
        select: {name: 'name', category: 'category.en'},
        prepare({name, category}: {name?: string; category?: string}) {
            return {title: name || '(unnamed cookie)', subtitle: category}
        },
    },
})
