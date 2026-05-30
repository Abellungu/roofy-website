import {defineType} from 'sanity'

/* A numbered section inside a legalPage document (privacy / cookies / terms).
 * Heading is a short bilingual string; body is rich text. */
export default defineType({
    name: 'legalSection',
    title: 'Legal section',
    type: 'object',
    fields: [
        {
            name: 'heading',
            title: 'Heading',
            type: 'bilingualString',
            description: 'e.g. "01 · Information we collect" / "01 · 我们收集的信息"',
        },
        {
            name: 'body',
            title: 'Body',
            type: 'bilingualPortable',
        },
    ],
    preview: {
        select: {zh: 'heading.zh', en: 'heading.en'},
        prepare({zh, en}: {zh?: string; en?: string}) {
            return {title: zh || en || '(untitled section)'}
        },
    },
})
