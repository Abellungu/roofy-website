import {defineType} from 'sanity'

/* Singleton replacing the entire site/assets/js/i18n.js table.
 * Organised into top-level groups (tabs) so editors don't see a 700-field wall.
 * Pillar titles / property data / team bios are NOT duplicated here — they
 * live in pillar / property / teamMember documents and are merged into i18n.js
 * by the pull-i18n.ts build step. */

const bs = 'bilingualString'
const bt = 'bilingualText'

/* Builds a flat array of bilingualString fields, all assigned to one group. */
function bsFields(group: string, fields: Array<{name: string; title: string; type?: 'bilingualString' | 'bilingualText'}>) {
    return fields.map((f) => ({
        name: f.name,
        title: f.title,
        type: f.type || bs,
        group,
    }))
}

export default defineType({
    name: 'siteContent',
    title: 'Site content',
    type: 'document',
    groups: [
        {name: 'hero', title: 'Hero & Top', default: true},
        {name: 'about', title: 'About / Mission / Vision'},
        {name: 'values', title: 'Core values'},
        {name: 'sections', title: 'Section headers'},
        {name: 'process', title: 'Process steps'},
        {name: 'pillars', title: 'Pillar pages UI'},
        {name: 'properties', title: 'Properties UI'},
        {name: 'contact', title: 'Contact + form'},
        {name: 'whatsapp', title: 'WhatsApp pre-text'},
        {name: 'cookies', title: 'Cookies banner'},
        {name: 'cta', title: 'CTA labels'},
        {name: 'nav', title: 'Navigation'},
        {name: 'common', title: 'Common UI'},
        {name: 'footer', title: 'Footer'},
    ],
    fields: [
        // ─── HERO ────────────────────────────────────────────────────────────
        ...bsFields('hero', [
            {name: 'heroEyebrow', title: 'Hero eyebrow'},
            {name: 'heroTitle1', title: 'Hero title — line 1 (English: "Built on Light")'},
            {name: 'heroTitle2', title: 'Hero title — line 2 (gold italic line)'},
            {name: 'heroDesc', title: 'Hero description (paragraph)', type: bt},
            {name: 'heroPrimary', title: 'Hero primary CTA button'},
            {name: 'heroSecondary', title: 'Hero secondary CTA button'},
        ]),
        {
            name: 'marquee',
            title: 'Marquee tokens (rotating brand keywords)',
            type: 'array',
            of: [{type: 'bilingualString'}],
            group: 'hero',
            validation: (Rule) => Rule.min(4).max(20),
        },

        // ─── ABOUT / MISSION / VISION ────────────────────────────────────────
        ...bsFields('about', [
            {name: 'aboutEyebrow', title: 'About teaser eyebrow'},
            {name: 'aboutTitle', title: 'About teaser title'},
            {name: 'aboutBody', title: 'About teaser body — paragraph 1', type: bt},
            {name: 'aboutBody2', title: 'About teaser body — paragraph 2', type: bt},
            {name: 'aboutCta', title: 'About teaser CTA'},
            {name: 'missionEyebrow', title: 'Mission eyebrow'},
            {name: 'missionTitle', title: 'Mission title'},
            {name: 'missionDesc', title: 'Mission description', type: bt},
            {name: 'visionEyebrow', title: 'Vision eyebrow'},
            {name: 'visionTitle', title: 'Vision title'},
            {name: 'visionDesc', title: 'Vision description', type: bt},
        ]),

        // ─── CORE VALUES ─────────────────────────────────────────────────────
        ...bsFields('values', [
            {name: 'valuesEyebrow', title: 'Values band eyebrow'},
            {name: 'valuesTitle', title: 'Values band title'},
        ]),
        {
            name: 'valuesItems',
            title: 'Six core values',
            type: 'array',
            group: 'values',
            of: [
                {
                    type: 'object',
                    fields: [
                        {name: 'icon', title: 'Icon', type: 'lucideIcon'},
                        {name: 'label', title: 'Label', type: 'bilingualString'},
                        {name: 'description', title: 'Description', type: 'bilingualString'},
                    ],
                    preview: {
                        select: {zh: 'label.zh', en: 'label.en'},
                        prepare({zh, en}: {zh?: string; en?: string}) {
                            return {title: en || zh || '(unnamed value)'}
                        },
                    },
                },
            ],
            validation: (Rule) => Rule.min(3).max(8),
        },

        // ─── SECTION HEADERS (eyebrow + title pairs) ─────────────────────────
        ...bsFields('sections', [
            {name: 'servicesEyebrow', title: 'Services band eyebrow'},
            {name: 'servicesTitle', title: 'Services band title'},
            {name: 'featuredEyebrow', title: 'Featured properties eyebrow'},
            {name: 'featuredTitle', title: 'Featured properties title'},
            {name: 'featuredSubtitle', title: 'Featured properties subtitle', type: bt},
            {name: 'featuredViewAll', title: '"See all properties" link text'},
            {name: 'featuredBedroom', title: 'Bedroom abbreviation (e.g. Bd / 卧)'},
            {name: 'featuredBathroom', title: 'Bathroom abbreviation (e.g. Ba / 卫)'},
            {name: 'featuredSample', title: '"Sample" badge label'},
            {name: 'teamEyebrow', title: 'Team band eyebrow'},
            {name: 'teamTitle', title: 'Team band title'},
        ]),
        {
            name: 'featuredFilters',
            title: 'Property filter labels',
            type: 'object',
            group: 'sections',
            fields: [
                {name: 'all', title: 'All', type: 'bilingualString'},
                {name: 'new', title: 'New', type: 'bilingualString'},
                {name: 'resale', title: 'Resale', type: 'bilingualString'},
                {name: 'rent', title: 'Rent', type: 'bilingualString'},
                {name: 'land', title: 'Land', type: 'bilingualString'},
            ],
        },

        // ─── PROCESS STEPS ───────────────────────────────────────────────────
        ...bsFields('process', [
            {name: 'processEyebrow', title: 'Process eyebrow'},
            {name: 'processTitle', title: 'Process title'},
        ]),
        {
            name: 'processItems',
            title: 'Four process steps',
            type: 'array',
            group: 'process',
            of: [
                {
                    type: 'object',
                    fields: [
                        {name: 'number', title: 'Step number (e.g. 01)', type: 'string'},
                        {name: 'title', title: 'Step title', type: 'bilingualString'},
                        {name: 'description', title: 'Step description', type: 'bilingualString'},
                    ],
                    preview: {
                        select: {n: 'number', zh: 'title.zh', en: 'title.en'},
                        prepare({n, zh, en}: {n?: string; zh?: string; en?: string}) {
                            return {title: `${n || '00'} · ${en || zh || ''}`}
                        },
                    },
                },
            ],
            validation: (Rule) => Rule.length(4),
        },

        // ─── PILLAR PAGES UI (advertising empty state, branding approach) ───
        ...bsFields('pillars', [
            {name: 'pillarsDeliverablesTitle', title: 'Deliverables band header'},
            {name: 'pillarsCasesTitle', title: 'Case-studies band header'},
            {name: 'pillarsCasesEmpty', title: 'Empty case-studies message', type: bt},
            {name: 'pillarsAdjacent', title: '"Keep exploring" CTA'},
            {name: 'pillarsCtaBig', title: 'Pillar CTA banner (big headline)', type: bt},
            {name: 'pillarsCtaBtn', title: 'Pillar CTA button'},
            {name: 'pillarsRealEstateInquire', title: 'Real-estate inquire CTA'},
            {name: 'pillarsAdvertisingInquire', title: 'Advertising inquire CTA'},
            {name: 'pillarsBrandingInquire', title: 'Branding inquire CTA'},
            {name: 'pillarsAdvCapabilitiesTitle', title: 'Advertising — capabilities title'},
            {name: 'pillarsAdvCapabilitiesDesc', title: 'Advertising — capabilities description', type: bt},
            {name: 'pillarsAdvEmptyBadge', title: 'Advertising — empty-inventory badge'},
            {name: 'pillarsAdvEmptyTitle', title: 'Advertising — empty-inventory title'},
            {name: 'pillarsAdvEmptyDesc', title: 'Advertising — empty-inventory description', type: bt},
            {name: 'pillarsAdvEmptyCta', title: 'Advertising — empty-inventory CTA'},
            {name: 'pillarsBrandingApproachTitle', title: 'Branding — approach title'},
            {name: 'pillarsBrandingApproachDesc', title: 'Branding — approach description', type: bt},
        ]),
        {
            name: 'pillarsCapabilities',
            title: 'Advertising capabilities tiles (4)',
            type: 'array',
            group: 'pillars',
            of: [
                {
                    type: 'object',
                    fields: [
                        {name: 'icon', title: 'Icon', type: 'lucideIcon'},
                        {name: 'label', title: 'Label', type: 'bilingualString'},
                        {name: 'description', title: 'Description', type: 'bilingualString'},
                    ],
                },
            ],
        },
        {
            name: 'pillarsApproach',
            title: 'Branding 3-step approach',
            type: 'array',
            group: 'pillars',
            of: [
                {
                    type: 'object',
                    fields: [
                        {name: 'number', title: 'Step number', type: 'string'},
                        {name: 'title', title: 'Step title', type: 'bilingualString'},
                        {name: 'description', title: 'Step description', type: 'bilingualString'},
                    ],
                },
            ],
        },

        // ─── PROPERTIES UI (listing + detail page strings) ──────────────────
        ...bsFields('properties', [
            {name: 'propertiesEyebrow', title: 'Listing eyebrow'},
            {name: 'propertiesTitle', title: 'Listing title'},
            {name: 'propertiesSubtitle', title: 'Listing subtitle', type: bt},
            {name: 'propertiesEmpty', title: 'Empty-filter message', type: bt},
            {name: 'propertiesCount', title: 'Count line (use {n} as placeholder)'},
            {name: 'propertiesDetailBack', title: 'Detail page — back link'},
            {name: 'propertiesDetailInquire', title: 'Detail page — inquire CTA'},
            {name: 'propertiesDetailInquireDesc', title: 'Detail page — inquire description', type: bt},
            {name: 'propertiesDetailDescription', title: 'Detail page — description heading'},
            {name: 'propertiesDetailLocation', title: 'Detail page — location heading'},
            {name: 'propertiesDetailSimilar', title: 'Detail page — similar heading'},
            {name: 'propertiesDetailSimilarDesc', title: 'Detail page — similar description'},
            {name: 'propertiesDetailNotFoundTitle', title: 'Detail page — 404 title'},
            {name: 'propertiesDetailNotFoundDesc', title: 'Detail page — 404 description', type: bt},
            {name: 'propertiesDetailShareTitle', title: 'Detail page — share title'},
            {name: 'propertiesDetailWhatsappPrefill', title: 'Detail page — WhatsApp pre-text', type: bt},
            {name: 'propertiesDetailPriceLabel', title: 'Detail page — price label'},
            {name: 'propertiesDetailSpecType', title: 'Specs strip — type label'},
            {name: 'propertiesDetailSpecArea', title: 'Specs strip — area label'},
            {name: 'propertiesDetailSpecBeds', title: 'Specs strip — beds label'},
            {name: 'propertiesDetailSpecBaths', title: 'Specs strip — baths label'},
            {name: 'propertiesDetailSpecPrice', title: 'Specs strip — price label'},
        ]),

        // ─── CONTACT FORM + INFO ────────────────────────────────────────────
        ...bsFields('contact', [
            {name: 'contactEyebrow', title: 'Contact eyebrow'},
            {name: 'contactTitle', title: 'Contact title'},
            {name: 'contactDesc', title: 'Contact description', type: bt},
            {name: 'contactAddress', title: 'Address field label'},
            {name: 'contactPhone', title: 'Phone field label'},
            {name: 'contactEmail', title: 'Email field label'},
            {name: 'contactHours', title: 'Hours field label'},
            {name: 'contactFormName', title: 'Form: Your Name'},
            {name: 'contactFormEmail', title: 'Form: Your Email'},
            {name: 'contactFormPhone', title: 'Form: Phone'},
            {name: 'contactFormInterest', title: 'Form: Interest dropdown label'},
            {name: 'contactFormMessage', title: 'Form: Message'},
            {name: 'contactFormSubmit', title: 'Form: Submit button'},
            {name: 'contactFormSuccess', title: 'Form: Success toast', type: bt},
            {name: 'contactMapTitle', title: 'Map section title'},
            {name: 'contactMapHint', title: 'Map section hint'},
            {name: 'contactWhyTitle', title: '"Why ROOFY?" title'},
        ]),
        {
            name: 'contactInterest',
            title: 'Form: Interest dropdown options',
            type: 'object',
            group: 'contact',
            fields: [
                {name: 'realestate', title: 'Real Estate', type: 'bilingualString'},
                {name: 'led', title: 'LED Advertising', type: 'bilingualString'},
                {name: 'branding', title: 'Branding', type: 'bilingualString'},
                {name: 'other', title: 'Other', type: 'bilingualString'},
            ],
        },
        {
            name: 'contactWhyItems',
            title: '"Why ROOFY?" bullet list',
            type: 'array',
            group: 'contact',
            of: [{type: 'bilingualString'}],
            validation: (Rule) => Rule.max(8),
        },

        // ─── WHATSAPP PRE-TEXT (per page) ───────────────────────────────────
        ...bsFields('whatsapp', [
            {name: 'whatsappLabel', title: 'WhatsApp aria-label'},
            {name: 'whatsappHome', title: 'Pre-text — home', type: bt},
            {name: 'whatsappAbout', title: 'Pre-text — about', type: bt},
            {name: 'whatsappContact', title: 'Pre-text — contact', type: bt},
            {name: 'whatsappRealEstate', title: 'Pre-text — real-estate pillar', type: bt},
            {name: 'whatsappAdvertising', title: 'Pre-text — advertising pillar', type: bt},
            {name: 'whatsappBranding', title: 'Pre-text — branding pillar', type: bt},
            {name: 'whatsappProperties', title: 'Pre-text — properties listing', type: bt},
            {name: 'whatsappPropertyDetail', title: 'Pre-text — property detail (generic)', type: bt},
            {name: 'whatsappLegal', title: 'Pre-text — legal pages', type: bt},
        ]),

        // ─── COOKIES BANNER ─────────────────────────────────────────────────
        ...bsFields('cookies', [
            {name: 'cookiesTitle', title: 'Banner title', type: bt},
            {name: 'cookiesDesc', title: 'Banner description', type: bt},
            {name: 'cookiesAccept', title: '"Accept" button'},
            {name: 'cookiesReject', title: '"Essential only" button'},
            {name: 'cookiesSettings', title: '"Learn more" link'},
            {name: 'cookiesManage', title: '"Manage cookies" button (on /cookies.html)'},
            {name: 'cookiesManageDesc', title: 'Manage button description', type: bt},
            {name: 'cookiesCleared', title: 'Confirmation when cleared'},
        ]),

        // ─── CTA LABELS ─────────────────────────────────────────────────────
        ...bsFields('cta', [
            {name: 'ctaContact', title: 'CTA — Contact us'},
            {name: 'ctaWhatsapp', title: 'CTA — Chat on WhatsApp'},
            {name: 'ctaViewProperties', title: 'CTA — View Properties'},
            {name: 'ctaLearnMore', title: 'CTA — Learn More'},
            {name: 'ctaInquire', title: 'CTA — Inquire'},
            {name: 'ctaSend', title: 'CTA — Send Message'},
            {name: 'ctaBig', title: 'Big-banner CTA headline', type: bt},
            {name: 'ctaBtn', title: 'Big-banner CTA button'},
        ]),

        // ─── NAVIGATION ─────────────────────────────────────────────────────
        ...bsFields('nav', [
            {name: 'navHome', title: 'Home'},
            {name: 'navAbout', title: 'About'},
            {name: 'navServices', title: 'Services (top-level)'},
            {name: 'navRealEstate', title: 'Real Estate'},
            {name: 'navAdvertising', title: 'LED Advertising'},
            {name: 'navBranding', title: 'Branding'},
            {name: 'navProperties', title: 'Properties'},
            {name: 'navContact', title: 'Contact'},
        ]),

        // ─── COMMON ─────────────────────────────────────────────────────────
        ...bsFields('common', [
            {name: 'commonScrollHint', title: 'Hero "scroll to explore" hint'},
            {name: 'commonComingSoon', title: '"Stories — coming soon" headline'},
            {name: 'commonComingSoonDesc', title: '"Coming soon" description', type: bt},
            {name: 'commonQuoteHint', title: '"Want to be the next story?" prompt'},
            {name: 'commonEst', title: 'Hero side: "EST · 2024 · Lusaka, Zambia"'},
        ]),

        // ─── FOOTER ─────────────────────────────────────────────────────────
        ...bsFields('footer', [
            {name: 'footerDesc', title: 'Footer description', type: bt},
            {name: 'footerExplore', title: 'Footer column: Explore'},
            {name: 'footerServices', title: 'Footer column: Services'},
            {name: 'footerLegal', title: 'Footer column: Legal'},
            {name: 'footerPrivacy', title: 'Legal link: Privacy'},
            {name: 'footerCookies', title: 'Legal link: Cookies'},
            {name: 'footerTerms', title: 'Legal link: Terms'},
            {name: 'footerRights', title: 'Footer rights line'},
            {name: 'footerSloganLine', title: 'Footer slogan line (Build · Brand · Grow)'},
        ]),
    ],
    preview: {
        prepare() {
            return {title: 'Site content (singleton — UI strings)'}
        },
    },
})
