import {defineType} from 'sanity'

/* One of the three legal pages: /privacy.html, /cookies.html, /terms.html.
 * Content is bilingual. Each page renders intro + numbered sections, with
 * cookies.html additionally rendering the cookieTable. */
export default defineType({
    name: 'legalPage',
    title: 'Legal page',
    type: 'document',
    fields: [
        {
            name: 'slug',
            title: 'Slug (URL)',
            type: 'slug',
            options: {maxLength: 30, source: 'title.en'},
            validation: (Rule) =>
                Rule.required().custom((slug) => {
                    if (!slug?.current) return true
                    return ['privacy', 'cookies', 'terms'].includes(slug.current)
                        ? true
                        : 'Slug must be one of: privacy / cookies / terms'
                }),
        },
        {name: 'title', title: 'Title', type: 'bilingualString', validation: (Rule) => Rule.required()},
        {
            name: 'lastUpdated',
            title: 'Last-updated stripe',
            type: 'bilingualString',
            description:
                'Shown under the page title. KEEP the `(Draft — pending legal review)` / `（草案 · 待法律审阅）` suffix until counsel signs off.',
            validation: (Rule) =>
                Rule.custom((val: {zh?: string; en?: string} | undefined) => {
                    if (!val) return true
                    if (val.zh && !val.zh.includes('草案') && !val.zh.includes('Draft')) {
                        return 'zh: must keep the "（草案 · 待法律审阅）" suffix until counsel approves'
                    }
                    if (val.en && !val.en.toLowerCase().includes('draft') && !val.en.toLowerCase().includes('pending')) {
                        return 'en: must keep the "(Draft — pending legal review)" suffix until counsel approves'
                    }
                    return true
                }),
        },
        {name: 'intro', title: 'Intro paragraph', type: 'bilingualText'},
        {
            name: 'sections',
            title: 'Sections',
            type: 'array',
            of: [{type: 'legalSection'}],
        },
        {
            name: 'cookieTable',
            title: 'Cookie table (only for /cookies.html)',
            type: 'object',
            hidden: ({parent}: {parent?: {slug?: {current?: string}}}) =>
                parent?.slug?.current !== 'cookies',
            fields: [
                {name: 'title', title: 'Table title', type: 'bilingualString'},
                {
                    name: 'rows',
                    title: 'Rows',
                    type: 'array',
                    of: [{type: 'cookieRow'}],
                },
                {
                    name: 'columns',
                    title: 'Column headers',
                    type: 'object',
                    fields: [
                        {name: 'name', title: 'Name column', type: 'bilingualString'},
                        {name: 'purpose', title: 'Purpose column', type: 'bilingualString'},
                        {name: 'duration', title: 'Duration column', type: 'bilingualString'},
                        {name: 'category', title: 'Category column', type: 'bilingualString'},
                    ],
                },
            ],
        },
    ],
    preview: {
        select: {zh: 'title.zh', en: 'title.en', slug: 'slug.current'},
        prepare({zh, en, slug}: {zh?: string; en?: string; slug?: string}) {
            return {title: en || zh || '(untitled)', subtitle: slug ? `/${slug}.html` : ''}
        },
    },
})
