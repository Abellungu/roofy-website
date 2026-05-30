import {defineType} from 'sanity'

/* Singleton holding contact info, social links, analytics IDs.
 * Changes here propagate to the bundled site/assets/js/settings.js via
 * pull-i18n.ts and to JSON-LD via pull-data.ts. */
export default defineType({
    name: 'siteSettings',
    title: 'Site settings',
    type: 'document',
    groups: [
        {name: 'contact', title: 'Contact', default: true},
        {name: 'hours', title: 'Hours'},
        {name: 'social', title: 'Social'},
        {name: 'analytics', title: 'Analytics & Maps'},
    ],
    fields: [
        // ─── CONTACT ────────────────────────────────────────────────────────
        {
            name: 'address',
            title: 'Office address',
            type: 'bilingualString',
            group: 'contact',
        },
        {
            name: 'phone',
            title: 'Phone (display form, with country code)',
            type: 'string',
            group: 'contact',
            initialValue: '+260 964 813 736',
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
            group: 'contact',
            initialValue: 'roofy@mingyangrt.com',
            validation: (Rule) => Rule.email(),
        },
        {
            name: 'whatsappNumber',
            title: 'WhatsApp number (digits only, country code first)',
            type: 'string',
            group: 'contact',
            description: 'No spaces or symbols. Used to build wa.me/<number> deeplinks.',
            initialValue: '260964813736',
            validation: (Rule) => Rule.regex(/^\d{8,15}$/, {name: 'digits-only phone number'}),
        },

        // ─── HOURS ──────────────────────────────────────────────────────────
        {
            name: 'workingHours',
            title: 'Working hours (3 lines)',
            type: 'array',
            of: [{type: 'bilingualString'}],
            group: 'hours',
            validation: (Rule) => Rule.max(7),
            initialValue: [],
            description: 'One bilingual line per row, e.g. "Mon – Fri  08:00 – 17:00".',
        },

        // ─── SOCIAL ─────────────────────────────────────────────────────────
        {
            name: 'socialLinks',
            title: 'Social links',
            type: 'array',
            group: 'social',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'platform',
                            title: 'Platform',
                            type: 'string',
                            options: {
                                list: [
                                    {title: 'Instagram', value: 'instagram'},
                                    {title: 'Facebook', value: 'facebook'},
                                    {title: 'LinkedIn', value: 'linkedin'},
                                    {title: 'YouTube', value: 'youtube'},
                                    {title: 'WeChat', value: 'wechat'},
                                    {title: 'X (Twitter)', value: 'x'},
                                ],
                            },
                        },
                        {name: 'url', title: 'URL', type: 'url'},
                    ],
                    preview: {
                        select: {p: 'platform', u: 'url'},
                        prepare({p, u}: {p?: string; u?: string}) {
                            return {title: p || '(no platform)', subtitle: u}
                        },
                    },
                },
            ],
        },

        // ─── ANALYTICS ─────────────────────────────────────────────────────
        {
            name: 'ga4Id',
            title: 'Google Analytics 4 measurement ID',
            type: 'string',
            group: 'analytics',
            placeholder: 'G-XXXXXXXXXX',
            description: 'Leave empty to keep analytics dormant.',
        },
        {
            name: 'metaPixelId',
            title: 'Meta (Facebook) Pixel ID',
            type: 'string',
            group: 'analytics',
            placeholder: '123456789012345',
            description: 'Leave empty to keep Pixel dormant.',
        },
        {
            name: 'mapsEmbedUrl',
            title: 'Google Maps embed URL override (optional)',
            type: 'url',
            group: 'analytics',
            description:
                'If empty, the contact page generates a default embed for the Ibex Hill address. Override here if needed.',
        },
    ],
    preview: {
        prepare() {
            return {title: 'Site settings (singleton — contact / social / analytics)'}
        },
    },
})
