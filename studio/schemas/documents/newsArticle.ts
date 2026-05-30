import {defineType} from 'sanity'

/* A news article. Surfaces under one of three categories on the site:
 *   - international           国际要闻
 *   - lusaka                  卢萨卡要闻
 *   - lusaka-real-estate      卢萨卡地产要闻速递
 * The listing page /news/index.html filters by category via tab,
 * and detail /news/article.html?id=<slug> renders one article. */
export default defineType({
    name: 'newsArticle',
    title: 'News article',
    type: 'document',
    fields: [
        {
            name: 'slug',
            title: 'Slug (URL id)',
            type: 'slug',
            options: {
                source: (doc: any) => doc?.title?.en || doc?.title?.zh || 'untitled-article',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    {title: '国际要闻 · International', value: 'international'},
                    {title: '卢萨卡要闻 · Lusaka', value: 'lusaka'},
                    {title: '卢萨卡地产要闻速递 · Lusaka real estate', value: 'lusaka-real-estate'},
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'placeholder',
            title: 'Placeholder / sample article',
            type: 'boolean',
            initialValue: false,
            description:
                'Mark `true` while content is illustrative. Toggle off only when the article is real and approved for publication.',
        },
        {
            name: 'publishedAt',
            title: 'Publication date',
            type: 'date',
            options: {dateFormat: 'YYYY-MM-DD'},
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'title',
            title: 'Title',
            type: 'bilingualString',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'excerpt',
            title: 'Excerpt (1-2 sentences shown on listing cards)',
            type: 'bilingualText',
        },
        {
            name: 'coverImage',
            title: 'Cover image',
            type: 'image',
            options: {hotspot: true},
        },
        {
            name: 'body',
            title: 'Body',
            type: 'bilingualPortable',
        },
        {
            name: 'source',
            title: 'Source (e.g. "Lusaka Times")',
            type: 'string',
            description: 'Optional. Fill if the article is relayed from an external publication.',
        },
        {
            name: 'sourceUrl',
            title: 'Source URL',
            type: 'url',
            description: 'Optional. Link back to the original article if relayed.',
        },
    ],
    orderings: [
        {
            title: 'Published date, newest first',
            name: 'publishedAtDesc',
            by: [{field: 'publishedAt', direction: 'desc'}],
        },
    ],
    preview: {
        select: {
            titleZh: 'title.zh',
            titleEn: 'title.en',
            category: 'category',
            publishedAt: 'publishedAt',
            placeholder: 'placeholder',
            media: 'coverImage',
        },
        prepare(sel: any) {
            const catLabel = {
                international: '国际',
                lusaka: '卢萨卡',
                'lusaka-real-estate': '卢萨卡地产',
            }[sel.category as string] || sel.category
            return {
                ...sel,
                title: sel.titleEn || sel.titleZh || '(Untitled)',
                subtitle: [catLabel, sel.publishedAt].filter(Boolean).join(' · ') +
                    (sel.placeholder ? ' · 示例' : ''),
            }
        },
    },
})
