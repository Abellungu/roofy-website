#!/usr/bin/env tsx
/* Build-time content pull — siteContent + siteSettings → site/assets/js/i18n.js
 * and site/assets/js/settings.js. Runs in the Cloudflare Pages build step
 * after every Sanity content change.
 *
 * Usage: npm run pull:i18n   (in studio/) */
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import {createClient} from '@sanity/client'

dotenv.config({path: path.resolve(__dirname, '../.env.local')})
dotenv.config({path: path.resolve(__dirname, '../.env')})

const ROOT = path.resolve(__dirname, '../..')
const SITE_JS = path.join(ROOT, 'site/assets/js')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
if (!projectId) {
    console.error('SANITY_STUDIO_PROJECT_ID is not set.')
    process.exit(1)
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: '2026-01-01',
    useCdn: true,
    token: process.env.SANITY_AUTH_TOKEN,
})

const SITE_CONTENT_QUERY = `*[_id == "siteContent"][0]`
const SETTINGS_QUERY = `*[_id == "siteSettings"][0]`
/* Pull pillar docs to flesh out i18n.services.items[] + i18n.pillars.{realEstate,advertising,branding} */
const PILLARS_QUERY = `*[_type == "pillar"] | order(slug.current asc) {
  "id": slug.current, icon, title, summary, heroEyebrow, heroTitle, inquireCta
}`
/* Pull team docs (for i18n.team.members[]) */
const TEAM_QUERY = `*[_type == "teamMember"] | order(orderRank asc) {
  "id": slug.current, name, nameZh, role, bio
}`

function bs(v: any): {zh: string; en: string} {
    if (!v) return {zh: '', en: ''}
    return {zh: v.zh || '', en: v.en || ''}
}

function joinBlocks(blocks?: any[]): string {
    if (!blocks?.length) return ''
    return blocks
        .filter((b) => b._type === 'block')
        .map((b) => (b.children || []).map((c: any) => c.text || '').join(''))
        .join('\n\n')
}

async function main() {
    console.log(`Pulling content from Sanity (${projectId}/${dataset})…`)

    const [sc, settings, pillars, team] = await Promise.all([
        client.fetch(SITE_CONTENT_QUERY),
        client.fetch(SETTINGS_QUERY),
        client.fetch(PILLARS_QUERY),
        client.fetch(TEAM_QUERY),
    ])

    if (!sc) {
        console.error('siteContent singleton not found. Run `npm run migrate` first.')
        process.exit(1)
    }
    if (!settings) {
        console.error('siteSettings singleton not found.')
        process.exit(1)
    }

    /* Build the I18N object in the legacy shape consumed by site/assets/js/*. */
    const buildI18N = (lang: 'zh' | 'en') => {
        const pillarByIdLang = (id: string) => {
            const p = pillars.find((x: any) => x.id === id)
            if (!p) return {}
            return {
                tag: id === 'real-estate' ? '01' : id === 'advertising' ? '02' : '03',
                eyebrow: bs(p.heroEyebrow)[lang],
                title: bs(p.heroTitle)[lang],
                summary: joinBlocks(bs(p.summary)[lang] as any) || bs(p.summary)[lang],
                inquire: bs(p.inquireCta)[lang],
            }
        }

        return {
            brand: {
                name: 'Roofy Investments Zambia',
                short: 'ROOFY',
                tagline: lang === 'zh' ? '筑造 · 塑造品牌 · 共同成长' : 'Build · Brand · Grow',
                taglineEn: 'Build · Brand · Grow',
            },
            nav: {
                home: bs(sc.navHome)[lang],
                about: bs(sc.navAbout)[lang],
                services: bs(sc.navServices)[lang],
                realEstate: bs(sc.navRealEstate)[lang],
                advertising: bs(sc.navAdvertising)[lang],
                branding: bs(sc.navBranding)[lang],
                properties: bs(sc.navProperties)[lang],
                contact: bs(sc.navContact)[lang],
            },
            cta: {
                contact: bs(sc.ctaContact)[lang],
                whatsapp: bs(sc.ctaWhatsapp)[lang],
                viewProperties: bs(sc.ctaViewProperties)[lang],
                learnMore: bs(sc.ctaLearnMore)[lang],
                inquire: bs(sc.ctaInquire)[lang],
                send: bs(sc.ctaSend)[lang],
                ctaBig: bs(sc.ctaBig)[lang],
                ctaBtn: bs(sc.ctaBtn)[lang],
            },
            common: {
                scrollHint: bs(sc.commonScrollHint)[lang],
                comingSoon: bs(sc.commonComingSoon)[lang],
                comingSoonDesc: bs(sc.commonComingSoonDesc)[lang],
                quoteHint: bs(sc.commonQuoteHint)[lang],
                est: bs(sc.commonEst)[lang],
            },
            hero: {
                eyebrow: bs(sc.heroEyebrow)[lang],
                title1: bs(sc.heroTitle1)[lang],
                title2: bs(sc.heroTitle2)[lang],
                desc: bs(sc.heroDesc)[lang],
                primary: bs(sc.heroPrimary)[lang],
                secondary: bs(sc.heroSecondary)[lang],
            },
            marquee: (sc.marquee || []).map((m: any) => bs(m)[lang]),
            about: {
                eyebrow: bs(sc.aboutEyebrow)[lang],
                title: bs(sc.aboutTitle)[lang],
                body: bs(sc.aboutBody)[lang],
                body2: bs(sc.aboutBody2)[lang],
                cta: bs(sc.aboutCta)[lang],
            },
            mission: {
                eyebrow: bs(sc.missionEyebrow)[lang],
                title: bs(sc.missionTitle)[lang],
                desc: bs(sc.missionDesc)[lang],
            },
            vision: {
                eyebrow: bs(sc.visionEyebrow)[lang],
                title: bs(sc.visionTitle)[lang],
                desc: bs(sc.visionDesc)[lang],
            },
            values: {
                eyebrow: bs(sc.valuesEyebrow)[lang],
                title: bs(sc.valuesTitle)[lang],
                items: (sc.valuesItems || []).map((it: any) => ({
                    icon: it.icon,
                    t: bs(it.label)[lang],
                    e: bs(it.label)[lang === 'zh' ? 'en' : 'zh'],
                    d: bs(it.description)[lang],
                })),
            },
            services: {
                eyebrow: bs(sc.servicesEyebrow)[lang],
                title: bs(sc.servicesTitle)[lang],
                items: pillars.map((p: any, i: number) => ({
                    tag: ['01', '02', '03'][i] || `0${i + 1}`,
                    icon: p.icon,
                    title: bs(p.title)[lang],
                    desc: bs(p.summary)[lang],
                    href: `services/${p.id}.html`,
                    cta: bs(p.inquireCta)[lang] || (lang === 'zh' ? '了解更多' : 'Learn More'),
                })),
            },
            featured: {
                eyebrow: bs(sc.featuredEyebrow)[lang],
                title: bs(sc.featuredTitle)[lang],
                subtitle: bs(sc.featuredSubtitle)[lang],
                filters: {
                    all: bs(sc.featuredFilters?.all)[lang],
                    new: bs(sc.featuredFilters?.new)[lang],
                    resale: bs(sc.featuredFilters?.resale)[lang],
                    rent: bs(sc.featuredFilters?.rent)[lang],
                    land: bs(sc.featuredFilters?.land)[lang],
                },
                viewAll: bs(sc.featuredViewAll)[lang],
                bedroom: bs(sc.featuredBedroom)[lang],
                bathroom: bs(sc.featuredBathroom)[lang],
                sample: bs(sc.featuredSample)[lang],
            },
            process: {
                eyebrow: bs(sc.processEyebrow)[lang],
                title: bs(sc.processTitle)[lang],
                items: (sc.processItems || []).map((it: any) => ({
                    n: it.number,
                    t: bs(it.title)[lang],
                    d: bs(it.description)[lang],
                })),
            },
            team: {
                eyebrow: bs(sc.teamEyebrow)[lang],
                title: bs(sc.teamTitle)[lang],
                members: team.map((m: any) => ({
                    name: m.name,
                    nameZh: m.nameZh || '',
                    role: bs(m.role)[lang],
                    bio: bs(m.bio)[lang],
                })),
            },
            contact: {
                eyebrow: bs(sc.contactEyebrow)[lang],
                title: bs(sc.contactTitle)[lang],
                desc: bs(sc.contactDesc)[lang],
                address: bs(sc.contactAddress)[lang],
                phone: bs(sc.contactPhone)[lang],
                email: bs(sc.contactEmail)[lang],
                hours: bs(sc.contactHours)[lang],
                addressV: bs(settings.address)[lang],
                phoneV: settings.phone || '',
                emailV: settings.email || '',
                hoursV1: bs(settings.workingHours?.[0])[lang],
                hoursV2: bs(settings.workingHours?.[1])[lang],
                hoursV3: bs(settings.workingHours?.[2])[lang],
                formName: bs(sc.contactFormName)[lang],
                formEmail: bs(sc.contactFormEmail)[lang],
                formPhone: bs(sc.contactFormPhone)[lang],
                formInterest: bs(sc.contactFormInterest)[lang],
                formMessage: bs(sc.contactFormMessage)[lang],
                interest: {
                    realestate: bs(sc.contactInterest?.realestate)[lang],
                    led: bs(sc.contactInterest?.led)[lang],
                    branding: bs(sc.contactInterest?.branding)[lang],
                    other: bs(sc.contactInterest?.other)[lang],
                },
                formSubmit: bs(sc.contactFormSubmit)[lang],
                success: bs(sc.contactFormSuccess)[lang],
                mapTitle: bs(sc.contactMapTitle)[lang],
                mapHint: bs(sc.contactMapHint)[lang],
                why: {
                    title: bs(sc.contactWhyTitle)[lang],
                    items: (sc.contactWhyItems || []).map((it: any) => bs(it)[lang]),
                },
            },
            whatsapp: {
                label: bs(sc.whatsappLabel)[lang],
                home: bs(sc.whatsappHome)[lang],
                about: bs(sc.whatsappAbout)[lang],
                contact: bs(sc.whatsappContact)[lang],
                'real-estate': bs(sc.whatsappRealEstate)[lang],
                advertising: bs(sc.whatsappAdvertising)[lang],
                branding: bs(sc.whatsappBranding)[lang],
                properties: bs(sc.whatsappProperties)[lang],
                'property-detail': bs(sc.whatsappPropertyDetail)[lang],
                legal: bs(sc.whatsappLegal)[lang],
            },
            cookies: {
                title: bs(sc.cookiesTitle)[lang],
                desc: bs(sc.cookiesDesc)[lang],
                accept: bs(sc.cookiesAccept)[lang],
                reject: bs(sc.cookiesReject)[lang],
                settings: bs(sc.cookiesSettings)[lang],
                manage: bs(sc.cookiesManage)[lang],
                manageDesc: bs(sc.cookiesManageDesc)[lang],
                cleared: bs(sc.cookiesCleared)[lang],
            },
            footer: {
                desc: bs(sc.footerDesc)[lang],
                explore: bs(sc.footerExplore)[lang],
                services: bs(sc.footerServices)[lang],
                legal: bs(sc.footerLegal)[lang],
                privacy: bs(sc.footerPrivacy)[lang],
                cookies: bs(sc.footerCookies)[lang],
                terms: bs(sc.footerTerms)[lang],
                rights: bs(sc.footerRights)[lang],
                sloganLine: bs(sc.footerSloganLine)[lang],
            },
            pillars: {
                realEstate: pillarByIdLang('real-estate'),
                advertising: {
                    ...pillarByIdLang('advertising'),
                    capabilitiesTitle: bs(sc.pillarsAdvCapabilitiesTitle)[lang],
                    capabilitiesDesc: bs(sc.pillarsAdvCapabilitiesDesc)[lang],
                    empty: {
                        badge: bs(sc.pillarsAdvEmptyBadge)[lang],
                        title: bs(sc.pillarsAdvEmptyTitle)[lang],
                        desc: bs(sc.pillarsAdvEmptyDesc)[lang],
                        cta: bs(sc.pillarsAdvEmptyCta)[lang],
                    },
                },
                branding: {
                    ...pillarByIdLang('branding'),
                    approachTitle: bs(sc.pillarsBrandingApproachTitle)[lang],
                    approachDesc: bs(sc.pillarsBrandingApproachDesc)[lang],
                },
                capabilities: (sc.pillarsCapabilities || []).map((c: any) => ({
                    icon: c.icon,
                    t: bs(c.label)[lang],
                    d: bs(c.description)[lang],
                })),
                approach: (sc.pillarsApproach || []).map((s: any) => ({
                    n: s.number,
                    t: bs(s.title)[lang],
                    d: bs(s.description)[lang],
                })),
                casesTitle: bs(sc.pillarsCasesTitle)[lang],
                casesEmpty: bs(sc.pillarsCasesEmpty)[lang],
                adjacent: bs(sc.pillarsAdjacent)[lang],
                deliverablesTitle: bs(sc.pillarsDeliverablesTitle)[lang],
                ctaBig: bs(sc.pillarsCtaBig)[lang],
                ctaBtn: bs(sc.pillarsCtaBtn)[lang],
            },
            properties: {
                eyebrow: bs(sc.propertiesEyebrow)[lang],
                title: bs(sc.propertiesTitle)[lang],
                subtitle: bs(sc.propertiesSubtitle)[lang],
                empty: bs(sc.propertiesEmpty)[lang],
                count: bs(sc.propertiesCount)[lang],
                detail: {
                    back: bs(sc.propertiesDetailBack)[lang],
                    inquire: bs(sc.propertiesDetailInquire)[lang],
                    inquireDesc: bs(sc.propertiesDetailInquireDesc)[lang],
                    spec: {
                        type: bs(sc.propertiesDetailSpecType)[lang],
                        area: bs(sc.propertiesDetailSpecArea)[lang],
                        beds: bs(sc.propertiesDetailSpecBeds)[lang],
                        baths: bs(sc.propertiesDetailSpecBaths)[lang],
                        price: bs(sc.propertiesDetailSpecPrice)[lang],
                    },
                    description: bs(sc.propertiesDetailDescription)[lang],
                    location: bs(sc.propertiesDetailLocation)[lang],
                    similar: bs(sc.propertiesDetailSimilar)[lang],
                    similarDesc: bs(sc.propertiesDetailSimilarDesc)[lang],
                    notFoundTitle: bs(sc.propertiesDetailNotFoundTitle)[lang],
                    notFoundDesc: bs(sc.propertiesDetailNotFoundDesc)[lang],
                    shareTitle: bs(sc.propertiesDetailShareTitle)[lang],
                    whatsappPrefill: bs(sc.propertiesDetailWhatsappPrefill)[lang],
                    priceLabel: bs(sc.propertiesDetailPriceLabel)[lang],
                },
            },
        }
    }

    const I18N = {zh: buildI18N('zh'), en: buildI18N('en')}

    const i18nFile = `/* AUTO-GENERATED by studio/migrate/pull-i18n.ts — do not edit by hand.
 * Source: Sanity siteContent + pillar + teamMember documents.
 * Re-run: cd studio && npm run pull:i18n
 */
window.I18N = ${JSON.stringify(I18N, null, 4)};
`
    fs.writeFileSync(path.join(SITE_JS, 'i18n.js'), i18nFile, 'utf8')
    console.log(`✓ wrote site/assets/js/i18n.js (${i18nFile.length} bytes)`)

    /* settings.js — small generated file holding WhatsApp number + analytics IDs.
     * Loaded by partials.js + analytics.js. */
    const settingsFile = `/* AUTO-GENERATED by studio/migrate/pull-i18n.ts. */
window.ROOFY_SETTINGS = {
    whatsappNumber: ${JSON.stringify(settings.whatsappNumber || '260964813736')},
    phone: ${JSON.stringify(settings.phone || '+260 964 813 736')},
    email: ${JSON.stringify(settings.email || 'roofy@mingyangrt.com')},
    ga4Id: ${JSON.stringify(settings.ga4Id || '')},
    metaPixelId: ${JSON.stringify(settings.metaPixelId || '')},
    socialLinks: ${JSON.stringify(settings.socialLinks || [], null, 4)},
};
`
    fs.writeFileSync(path.join(SITE_JS, 'settings.js'), settingsFile, 'utf8')
    console.log(`✓ wrote site/assets/js/settings.js (${settingsFile.length} bytes)`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
