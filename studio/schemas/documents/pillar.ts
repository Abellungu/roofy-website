import {defineType} from 'sanity'

/* One of the three service pillars (real-estate / advertising / branding).
 * The home services band + the three /services/*.html pages read from this. */
export default defineType({
    name: 'pillar',
    title: 'Service pillar',
    type: 'document',
    fields: [
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                maxLength: 30,
                source: 'title.en',
            },
            validation: (Rule) =>
                Rule.required().custom((slug) => {
                    if (!slug?.current) return true
                    return ['real-estate', 'advertising', 'branding'].includes(slug.current)
                        ? true
                        : 'Slug must be one of: real-estate / advertising / branding'
                }),
            description: 'Must be `real-estate`, `advertising`, or `branding` (matches URL path).',
        },
        {name: 'icon', title: 'Icon', type: 'lucideIcon'},
        {
            name: 'title',
            title: 'Short title (shown on home services band + adjacent teaser)',
            type: 'bilingualString',
            description: 'e.g. "Real Estate Solutions" / "房地产解决方案"',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'summary',
            title: 'Short summary (shown on home services card)',
            type: 'bilingualText',
        },
        {
            name: 'heroEyebrow',
            title: 'Pillar-page hero eyebrow',
            type: 'bilingualString',
            description: 'Small label above the pillar-page hero headline. e.g. "Practice 01 · Real Estate"',
        },
        {
            name: 'heroTitle',
            title: 'Pillar-page hero headline (marketing copy)',
            type: 'bilingualString',
            description:
                'The long display headline on the pillar page hero. Differs from `title` above (which is the short business name).',
        },
        {
            name: 'inquireCta',
            title: '"Inquire" CTA label (pillar-page hero button)',
            type: 'bilingualString',
        },
        {
            name: 'heroImg',
            title: 'Hero image',
            type: 'image',
            options: {hotspot: true},
        },
        {
            name: 'narrative',
            title: 'Long-form narrative (2 paragraphs)',
            type: 'bilingualPortable',
        },
        {
            name: 'deliverables',
            title: 'Deliverables (4 tiles)',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {name: 'label', title: 'Label', type: 'bilingualString'},
                        {name: 'description', title: 'Description', type: 'bilingualText'},
                    ],
                    preview: {
                        select: {zh: 'label.zh', en: 'label.en'},
                        prepare({zh, en}: {zh?: string; en?: string}) {
                            return {title: zh || en || '(unnamed)'}
                        },
                    },
                },
            ],
            validation: (Rule) => Rule.max(8),
        },
        {
            name: 'caseStudies',
            title: 'Case studies (placeholder until real ones exist)',
            type: 'array',
            of: [{type: 'string'}],
            description: 'Empty array for now. Phase 4 introduces a `caseStudy` document type.',
            hidden: true,
        },
    ],
    preview: {
        select: {zh: 'title.zh', en: 'title.en', media: 'heroImg'},
        prepare({zh, en, media}: {zh?: string; en?: string; media?: unknown}) {
            return {title: en || zh || '(untitled pillar)', subtitle: zh, media: media as any}
        },
    },
})
