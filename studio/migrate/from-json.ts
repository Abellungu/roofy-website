#!/usr/bin/env tsx
/* One-shot migration from /site/assets/{data,img} into Sanity.
 *
 * Idempotent — re-running rewrites all docs. Safe to invoke multiple times.
 *
 * Usage:
 *   cd studio
 *   cp .env.example .env.local && fill in the values
 *   npm run migrate:dry      # prints what would be written
 *   npm run migrate          # actually writes
 */
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
dotenv.config({path: path.resolve(__dirname, '../.env.local')})
dotenv.config({path: path.resolve(__dirname, '../.env')})
import {createClient, type SanityClient} from '@sanity/client'
import {nanoid} from 'nanoid'

const ROOT = path.resolve(__dirname, '../..')
const SITE = path.join(ROOT, 'site')
const DATA = path.join(SITE, 'assets/data')
const IMG = path.join(SITE, 'assets/img')

const DRY = process.argv.includes('--dry-run')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_AUTH_TOKEN

if (!projectId) {
    console.error('SANITY_STUDIO_PROJECT_ID is not set. Copy .env.example to .env.local and fill it in.')
    process.exit(1)
}
if (!token && !DRY) {
    console.error('SANITY_AUTH_TOKEN is not set. Editor-scoped token required for write.')
    process.exit(1)
}

const client: SanityClient = createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2026-01-01',
    useCdn: false,
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJson<T>(file: string): T {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'))
}

/* Evaluate the i18n.js file (which assigns to window.I18N) and extract the table. */
function readI18N(): {zh: any; en: any} {
    const code = fs.readFileSync(path.join(SITE, 'assets/js/i18n.js'), 'utf8')
    const ctx: any = {window: {}}
    vm.runInNewContext(code, ctx)
    return ctx.window.I18N
}

/* Build a bilingualString object from zh/en string pair. */
function bs(zh: string | undefined, en: string | undefined) {
    if (!zh && !en) return undefined
    return {_type: 'bilingualString', zh: zh || '', en: en || ''}
}

/* Build a bilingualText from a pair. */
function bt(zh: string | undefined, en: string | undefined) {
    if (!zh && !en) return undefined
    return {_type: 'bilingualText', zh: zh || '', en: en || ''}
}

/* Wrap a plain string paragraph as a Sanity portable text block. */
function block(text: string) {
    return {
        _type: 'block',
        _key: nanoid(8),
        style: 'normal',
        markDefs: [],
        children: [{_type: 'span', _key: nanoid(8), text, marks: []}],
    }
}

/* Build a bilingualPortable from parallel paragraph arrays. */
function bp(zhParas: string[] | undefined, enParas: string[] | undefined) {
    const zh = (zhParas || []).map(block)
    const en = (enParas || []).map(block)
    return {_type: 'bilingualPortable', zh, en}
}

/* Parse the free-text price strings we used in Phase 1.
 * Handles: "K 30,000 / month", "Price on request", "K 1,500,000 · Negotiable",
 * "$ 1,000 – $ 2,000 / month", "K 1,500 / night", "$ 5,000 / month". */
function parsePrice(raw: string): any {
    if (!raw || /price on request/i.test(raw)) {
        return {_type: 'price', period: 'request', formatted: 'Price on request'}
    }
    const negotiable = /negotiable/i.test(raw)
    const cleaned = raw.replace(/[·,]/g, '').replace(/negotiable/i, '').trim()
    const currency: 'USD' | 'ZMW' = /\$/.test(cleaned) ? 'USD' : /K\b|K[\d ]/.test(cleaned) ? 'ZMW' : 'USD'
    const numbers = [...cleaned.matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replace(/,/g, '')))
    const amount = numbers[0]
    const amountMax = numbers.length > 1 ? numbers[1] : undefined
    let period: 'month' | 'total' | 'per-night' = 'total'
    if (/\bmonth\b/i.test(raw)) period = 'month'
    else if (/\bnight\b/i.test(raw)) period = 'per-night'
    return {
        _type: 'price',
        amount,
        amountMax,
        currency,
        period,
        negotiable: negotiable || undefined,
        formatted: raw,
    }
}

/* Upload an image file under /site/assets/img/. Returns Sanity asset _id. */
async function uploadImage(rel: string, label: string): Promise<string | null> {
    const abs = path.join(IMG, rel.replace(/^\/?assets\/img\//, ''))
    if (!fs.existsSync(abs)) {
        console.warn(`  [skip image] ${rel} (not found at ${abs})`)
        return null
    }
    if (DRY) {
        console.log(`  [dry] would upload ${rel} (${label})`)
        return `image-dryrun-${path.basename(abs)}`
    }
    const stream = fs.createReadStream(abs)
    const asset = await client.assets.upload('image', stream, {
        filename: path.basename(abs),
        contentType: 'image/jpeg',
    })
    console.log(`  uploaded ${rel} → ${asset._id}`)
    return asset._id
}

function imgRef(assetId: string | null) {
    if (!assetId) return undefined
    return {_type: 'image', asset: {_ref: assetId, _type: 'reference'}}
}

function orderRank(idx: number) {
    /* Plugin uses LexoRank-style strings; sequential 0|aaa... ordering is
     * fine for an initial seed — the plugin re-balances on first reorder. */
    const base = 'aaaaaa'
    const ch = String.fromCharCode(97 + idx)
    return `0|${base.slice(0, -1)}${ch}`
}

// ─── Data shapes (loose, for type-flexibility while reading JSON) ────────────

interface PropertyJson {
    id: string
    type: 'new' | 'resale' | 'rent' | 'land'
    placeholder: boolean
    img: string
    titleZh: string
    titleEn: string
    loc: string
    price: string
    area: string
    beds: number
    baths: number
    descZh?: string
    descEn?: string
}

interface TeamJson {
    id: string
    name: string
    nameZh: string
    role: string
    roleZh: string
    initials: string
    photo: string
}

interface ServicePillarJson {
    id: string
    icon: string
    title: string
    titleZh: string
    summary: string
    summaryZh: string
    heroImg: string
    narrative: string[]
    narrativeZh: string[]
    deliverables: string[]
    deliverablesZh: string[]
    deliverableDescEn: string[]
    deliverableDescZh: string[]
}

// ─── Main migration ─────────────────────────────────────────────────────────

async function main() {
    console.log(DRY ? '── DRY RUN ──' : '── LIVE MIGRATION ──')
    console.log(`Project: ${projectId} · Dataset: ${dataset}\n`)

    // 1. Read sources
    const propsJson = readJson<{items: PropertyJson[]}>('properties.json').items
    const teamJson = readJson<{members: TeamJson[]}>('team.json').members
    const servicesJson = readJson<{pillars: ServicePillarJson[]}>('services.json').pillars
    const legalJson = readJson<{zh: any; en: any}>('legal.json')
    const I18N = readI18N()

    // 2. Upload images
    console.log('=== Uploading assets ===')
    const propertyImg: Record<string, string | null> = {}
    for (const p of propsJson) {
        propertyImg[p.id] = await uploadImage(p.img, `property:${p.id}`)
    }
    const teamImg: Record<string, string | null> = {}
    for (const m of teamJson) {
        teamImg[m.id] = await uploadImage(m.photo, `team:${m.id}`)
    }
    const pillarImg: Record<string, string | null> = {}
    for (const s of servicesJson) {
        if (s.heroImg) pillarImg[s.id] = await uploadImage(s.heroImg, `pillar:${s.id}`)
    }

    // 3. Build docs
    const docs: any[] = []

    // ─── property documents ───────────────────────────────────────────────
    propsJson.forEach((p, idx) => {
        docs.push({
            _id: `property-${p.id}`,
            _type: 'property',
            slug: {_type: 'slug', current: p.id},
            category: p.type,
            placeholder: p.placeholder,
            image: imgRef(propertyImg[p.id]),
            orderRank: orderRank(idx),
            title: bs(p.titleZh, p.titleEn),
            location: bs(p.loc, p.loc),
            price: parsePrice(p.price),
            area: bs(p.area, p.area),
            beds: p.beds || 0,
            baths: p.baths || 0,
            description: bt(p.descZh, p.descEn),
        })
    })

    // ─── teamMember documents ─────────────────────────────────────────────
    teamJson.forEach((m, idx) => {
        const i18nMember = I18N.zh.team.members[idx]
        const enMember = I18N.en.team.members[idx]
        docs.push({
            _id: `teamMember-${m.id}`,
            _type: 'teamMember',
            slug: {_type: 'slug', current: m.id},
            orderRank: orderRank(idx),
            name: m.name,
            nameZh: m.nameZh || undefined,
            role: bs(m.roleZh, m.role),
            initials: m.initials,
            photo: imgRef(teamImg[m.id]),
            bio: bt(i18nMember?.bio, enMember?.bio),
        })
    })

    // ─── pillar documents ─────────────────────────────────────────────────
    const pillarI18nKey: Record<string, string> = {
        'real-estate': 'realEstate',
        advertising: 'advertising',
        branding: 'branding',
    }
    servicesJson.forEach((s) => {
        const k = pillarI18nKey[s.id]
        const zhPillar = I18N.zh.pillars[k] || {}
        const enPillar = I18N.en.pillars[k] || {}
        docs.push({
            _id: `pillar-${s.id}`,
            _type: 'pillar',
            slug: {_type: 'slug', current: s.id},
            icon: s.icon,
            title: bs(s.titleZh, s.title),
            summary: bt(s.summaryZh, s.summary),
            heroEyebrow: bs(zhPillar.eyebrow, enPillar.eyebrow),
            heroTitle: bs(zhPillar.title, enPillar.title),
            inquireCta: bs(zhPillar.inquire, enPillar.inquire),
            heroImg: imgRef(pillarImg[s.id]),
            narrative: bp(s.narrativeZh, s.narrative),
            deliverables: s.deliverables.map((labelEn, i) => ({
                _key: nanoid(8),
                label: bs(s.deliverablesZh[i], labelEn),
                description: bt(s.deliverableDescZh[i], s.deliverableDescEn[i]),
            })),
            caseStudies: [],
        })
    })

    // ─── legalPage documents ──────────────────────────────────────────────
    ;(['privacy', 'cookies', 'terms'] as const).forEach((slug) => {
        const zhDoc = legalJson.zh[slug]
        const enDoc = legalJson.en[slug]
        if (!zhDoc || !enDoc) return
        const sectionCount = Math.max(zhDoc.sections.length, enDoc.sections.length)
        const sections: any[] = []
        for (let i = 0; i < sectionCount; i++) {
            const zhSec = zhDoc.sections[i] || {heading: '', body: []}
            const enSec = enDoc.sections[i] || {heading: '', body: []}
            sections.push({
                _key: nanoid(8),
                _type: 'legalSection',
                heading: bs(zhSec.heading, enSec.heading),
                body: bp(zhSec.body || [], enSec.body || []),
            })
        }

        const doc: any = {
            _id: `legalPage-${slug}`,
            _type: 'legalPage',
            slug: {_type: 'slug', current: slug},
            title: bs(zhDoc.title, enDoc.title),
            lastUpdated: bs(zhDoc.lastUpdated, enDoc.lastUpdated),
            intro: bt(zhDoc.intro, enDoc.intro),
            sections,
        }
        if (slug === 'cookies' && zhDoc.cookieTable && enDoc.cookieTable) {
            doc.cookieTable = {
                title: bs(zhDoc.cookieTable.title, enDoc.cookieTable.title),
                rows: zhDoc.cookieTable.rows.map((r: any, i: number) => {
                    const er = enDoc.cookieTable.rows[i] || {}
                    return {
                        _key: nanoid(8),
                        _type: 'cookieRow',
                        name: r.name,
                        purpose: bs(r.purpose, er.purpose),
                        duration: r.duration,
                        category: bs(r.category, er.category),
                    }
                }),
                columns: {
                    name: bs(zhDoc.cookieTable.columns.name, enDoc.cookieTable.columns.name),
                    purpose: bs(zhDoc.cookieTable.columns.purpose, enDoc.cookieTable.columns.purpose),
                    duration: bs(zhDoc.cookieTable.columns.duration, enDoc.cookieTable.columns.duration),
                    category: bs(zhDoc.cookieTable.columns.category, enDoc.cookieTable.columns.category),
                },
            }
        }
        docs.push(doc)
    })

    // ─── siteContent singleton ────────────────────────────────────────────
    docs.push(buildSiteContent(I18N))

    // ─── siteSettings singleton ───────────────────────────────────────────
    docs.push(buildSiteSettings(I18N))

    console.log(`\n=== ${docs.length} documents prepared ===\n`)

    if (DRY) {
        console.log('Sample doc:', JSON.stringify(docs[0], null, 2).slice(0, 1000), '...')
        console.log('\nDry run complete — no writes. Re-run without --dry-run to commit.')
        return
    }

    // 4. Commit
    let tx = client.transaction()
    for (const d of docs) tx = tx.createOrReplace(d)
    const result = await tx.commit({visibility: 'async'})
    console.log(`Committed transaction: ${result.transactionId} (${result.results.length} docs)`)
}

// ─── siteContent builder ────────────────────────────────────────────────────

function buildSiteContent(I: {zh: any; en: any}): any {
    const z = I.zh
    const e = I.en

    return {
        _id: 'siteContent',
        _type: 'siteContent',
        // hero
        heroEyebrow: bs(z.hero.eyebrow, e.hero.eyebrow),
        heroTitle1: bs(z.hero.title1, e.hero.title1),
        heroTitle2: bs(z.hero.title2, e.hero.title2),
        heroDesc: bt(z.hero.desc, e.hero.desc),
        heroPrimary: bs(z.hero.primary, e.hero.primary),
        heroSecondary: bs(z.hero.secondary, e.hero.secondary),
        marquee: z.marquee.map((zhVal: string, i: number) => ({
            _key: nanoid(8),
            ...bs(zhVal, e.marquee[i])!,
        })),
        // about/mission/vision
        aboutEyebrow: bs(z.about.eyebrow, e.about.eyebrow),
        aboutTitle: bs(z.about.title, e.about.title),
        aboutBody: bt(z.about.body, e.about.body),
        aboutBody2: bt(z.about.body2, e.about.body2),
        aboutCta: bs(z.about.cta, e.about.cta),
        missionEyebrow: bs(z.mission.eyebrow, e.mission.eyebrow),
        missionTitle: bs(z.mission.title, e.mission.title),
        missionDesc: bt(z.mission.desc, e.mission.desc),
        visionEyebrow: bs(z.vision.eyebrow, e.vision.eyebrow),
        visionTitle: bs(z.vision.title, e.vision.title),
        visionDesc: bt(z.vision.desc, e.vision.desc),
        // values
        valuesEyebrow: bs(z.values.eyebrow, e.values.eyebrow),
        valuesTitle: bs(z.values.title, e.values.title),
        valuesItems: z.values.items.map((zItem: any, i: number) => {
            const eItem = e.values.items[i] || {}
            return {
                _key: nanoid(8),
                icon: zItem.icon,
                label: bs(zItem.t, eItem.t),
                description: bs(zItem.d, eItem.d),
            }
        }),
        // sections
        servicesEyebrow: bs(z.services.eyebrow, e.services.eyebrow),
        servicesTitle: bs(z.services.title, e.services.title),
        featuredEyebrow: bs(z.featured.eyebrow, e.featured.eyebrow),
        featuredTitle: bs(z.featured.title, e.featured.title),
        featuredSubtitle: bt(z.featured.subtitle, e.featured.subtitle),
        featuredViewAll: bs(z.featured.viewAll, e.featured.viewAll),
        featuredBedroom: bs(z.featured.bedroom, e.featured.bedroom),
        featuredBathroom: bs(z.featured.bathroom, e.featured.bathroom),
        featuredSample: bs(z.featured.sample, e.featured.sample),
        teamEyebrow: bs(z.team.eyebrow, e.team.eyebrow),
        teamTitle: bs(z.team.title, e.team.title),
        featuredFilters: {
            all: bs(z.featured.filters.all, e.featured.filters.all),
            new: bs(z.featured.filters.new, e.featured.filters.new),
            resale: bs(z.featured.filters.resale, e.featured.filters.resale),
            rent: bs(z.featured.filters.rent, e.featured.filters.rent),
            land: bs(z.featured.filters.land, e.featured.filters.land),
        },
        // process
        processEyebrow: bs(z.process.eyebrow, e.process.eyebrow),
        processTitle: bs(z.process.title, e.process.title),
        processItems: z.process.items.map((zItem: any, i: number) => {
            const eItem = e.process.items[i] || {}
            return {
                _key: nanoid(8),
                number: zItem.n,
                title: bs(zItem.t, eItem.t),
                description: bs(zItem.d, eItem.d),
            }
        }),
        // pillars UI
        pillarsDeliverablesTitle: bs(z.pillars.deliverablesTitle, e.pillars.deliverablesTitle),
        pillarsCasesTitle: bs(z.pillars.casesTitle, e.pillars.casesTitle),
        pillarsCasesEmpty: bt(z.pillars.casesEmpty, e.pillars.casesEmpty),
        pillarsAdjacent: bs(z.pillars.adjacent, e.pillars.adjacent),
        pillarsCtaBig: bt(z.pillars.ctaBig, e.pillars.ctaBig),
        pillarsCtaBtn: bs(z.pillars.ctaBtn, e.pillars.ctaBtn),
        pillarsRealEstateInquire: bs(z.pillars.realEstate.inquire, e.pillars.realEstate.inquire),
        pillarsAdvertisingInquire: bs(z.pillars.advertising.inquire, e.pillars.advertising.inquire),
        pillarsBrandingInquire: bs(z.pillars.branding.inquire, e.pillars.branding.inquire),
        pillarsAdvCapabilitiesTitle: bs(z.pillars.advertising.capabilitiesTitle, e.pillars.advertising.capabilitiesTitle),
        pillarsAdvCapabilitiesDesc: bt(z.pillars.advertising.capabilitiesDesc, e.pillars.advertising.capabilitiesDesc),
        pillarsAdvEmptyBadge: bs(z.pillars.advertising.empty.badge, e.pillars.advertising.empty.badge),
        pillarsAdvEmptyTitle: bs(z.pillars.advertising.empty.title, e.pillars.advertising.empty.title),
        pillarsAdvEmptyDesc: bt(z.pillars.advertising.empty.desc, e.pillars.advertising.empty.desc),
        pillarsAdvEmptyCta: bs(z.pillars.advertising.empty.cta, e.pillars.advertising.empty.cta),
        pillarsBrandingApproachTitle: bs(z.pillars.branding.approachTitle, e.pillars.branding.approachTitle),
        pillarsBrandingApproachDesc: bt(z.pillars.branding.approachDesc, e.pillars.branding.approachDesc),
        pillarsCapabilities: z.pillars.capabilities.map((zCap: any, i: number) => {
            const eCap = e.pillars.capabilities[i] || {}
            return {
                _key: nanoid(8),
                icon: zCap.icon,
                label: bs(zCap.t, eCap.t),
                description: bs(zCap.d, eCap.d),
            }
        }),
        pillarsApproach: z.pillars.approach.map((zStep: any, i: number) => {
            const eStep = e.pillars.approach[i] || {}
            return {
                _key: nanoid(8),
                number: zStep.n,
                title: bs(zStep.t, eStep.t),
                description: bs(zStep.d, eStep.d),
            }
        }),
        // properties UI
        propertiesEyebrow: bs(z.properties.eyebrow, e.properties.eyebrow),
        propertiesTitle: bs(z.properties.title, e.properties.title),
        propertiesSubtitle: bt(z.properties.subtitle, e.properties.subtitle),
        propertiesEmpty: bt(z.properties.empty, e.properties.empty),
        propertiesCount: bs(z.properties.count, e.properties.count),
        propertiesDetailBack: bs(z.properties.detail.back, e.properties.detail.back),
        propertiesDetailInquire: bs(z.properties.detail.inquire, e.properties.detail.inquire),
        propertiesDetailInquireDesc: bt(z.properties.detail.inquireDesc, e.properties.detail.inquireDesc),
        propertiesDetailDescription: bs(z.properties.detail.description, e.properties.detail.description),
        propertiesDetailLocation: bs(z.properties.detail.location, e.properties.detail.location),
        propertiesDetailSimilar: bs(z.properties.detail.similar, e.properties.detail.similar),
        propertiesDetailSimilarDesc: bs(z.properties.detail.similarDesc, e.properties.detail.similarDesc),
        propertiesDetailNotFoundTitle: bs(z.properties.detail.notFoundTitle, e.properties.detail.notFoundTitle),
        propertiesDetailNotFoundDesc: bt(z.properties.detail.notFoundDesc, e.properties.detail.notFoundDesc),
        propertiesDetailShareTitle: bs(z.properties.detail.shareTitle, e.properties.detail.shareTitle),
        propertiesDetailWhatsappPrefill: bt(z.properties.detail.whatsappPrefill, e.properties.detail.whatsappPrefill),
        propertiesDetailPriceLabel: bs(z.properties.detail.priceLabel, e.properties.detail.priceLabel),
        propertiesDetailSpecType: bs(z.properties.detail.spec.type, e.properties.detail.spec.type),
        propertiesDetailSpecArea: bs(z.properties.detail.spec.area, e.properties.detail.spec.area),
        propertiesDetailSpecBeds: bs(z.properties.detail.spec.beds, e.properties.detail.spec.beds),
        propertiesDetailSpecBaths: bs(z.properties.detail.spec.baths, e.properties.detail.spec.baths),
        propertiesDetailSpecPrice: bs(z.properties.detail.spec.price, e.properties.detail.spec.price),
        // contact
        contactEyebrow: bs(z.contact.eyebrow, e.contact.eyebrow),
        contactTitle: bs(z.contact.title, e.contact.title),
        contactDesc: bt(z.contact.desc, e.contact.desc),
        contactAddress: bs(z.contact.address, e.contact.address),
        contactPhone: bs(z.contact.phone, e.contact.phone),
        contactEmail: bs(z.contact.email, e.contact.email),
        contactHours: bs(z.contact.hours, e.contact.hours),
        contactFormName: bs(z.contact.formName, e.contact.formName),
        contactFormEmail: bs(z.contact.formEmail, e.contact.formEmail),
        contactFormPhone: bs(z.contact.formPhone, e.contact.formPhone),
        contactFormInterest: bs(z.contact.formInterest, e.contact.formInterest),
        contactFormMessage: bs(z.contact.formMessage, e.contact.formMessage),
        contactFormSubmit: bs(z.contact.formSubmit, e.contact.formSubmit),
        contactFormSuccess: bt(z.contact.success, e.contact.success),
        contactMapTitle: bs(z.contact.mapTitle, e.contact.mapTitle),
        contactMapHint: bs(z.contact.mapHint, e.contact.mapHint),
        contactWhyTitle: bs(z.contact.why.title, e.contact.why.title),
        contactInterest: {
            realestate: bs(z.contact.interest.realestate, e.contact.interest.realestate),
            led: bs(z.contact.interest.led, e.contact.interest.led),
            branding: bs(z.contact.interest.branding, e.contact.interest.branding),
            other: bs(z.contact.interest.other, e.contact.interest.other),
        },
        contactWhyItems: z.contact.why.items.map((zItem: string, i: number) => ({
            _key: nanoid(8),
            ...bs(zItem, e.contact.why.items[i])!,
        })),
        // whatsapp
        whatsappLabel: bs(z.whatsapp.label, e.whatsapp.label),
        whatsappHome: bt(z.whatsapp.home, e.whatsapp.home),
        whatsappAbout: bt(z.whatsapp.about, e.whatsapp.about),
        whatsappContact: bt(z.whatsapp.contact, e.whatsapp.contact),
        whatsappRealEstate: bt(z.whatsapp['real-estate'], e.whatsapp['real-estate']),
        whatsappAdvertising: bt(z.whatsapp.advertising, e.whatsapp.advertising),
        whatsappBranding: bt(z.whatsapp.branding, e.whatsapp.branding),
        whatsappProperties: bt(z.whatsapp.properties, e.whatsapp.properties),
        whatsappPropertyDetail: bt(z.whatsapp['property-detail'], e.whatsapp['property-detail']),
        whatsappLegal: bt(z.whatsapp.legal, e.whatsapp.legal),
        // cookies
        cookiesTitle: bt(z.cookies.title, e.cookies.title),
        cookiesDesc: bt(z.cookies.desc, e.cookies.desc),
        cookiesAccept: bs(z.cookies.accept, e.cookies.accept),
        cookiesReject: bs(z.cookies.reject, e.cookies.reject),
        cookiesSettings: bs(z.cookies.settings, e.cookies.settings),
        cookiesManage: bs(z.cookies.manage, e.cookies.manage),
        cookiesManageDesc: bt(z.cookies.manageDesc, e.cookies.manageDesc),
        cookiesCleared: bs(z.cookies.cleared, e.cookies.cleared),
        // cta
        ctaContact: bs(z.cta.contact, e.cta.contact),
        ctaWhatsapp: bs(z.cta.whatsapp, e.cta.whatsapp),
        ctaViewProperties: bs(z.cta.viewProperties, e.cta.viewProperties),
        ctaLearnMore: bs(z.cta.learnMore, e.cta.learnMore),
        ctaInquire: bs(z.cta.inquire, e.cta.inquire),
        ctaSend: bs(z.cta.send, e.cta.send),
        ctaBig: bt(z.cta.ctaBig, e.cta.ctaBig),
        ctaBtn: bs(z.cta.ctaBtn, e.cta.ctaBtn),
        // nav
        navHome: bs(z.nav.home, e.nav.home),
        navAbout: bs(z.nav.about, e.nav.about),
        navServices: bs(z.nav.services, e.nav.services),
        navRealEstate: bs(z.nav.realEstate, e.nav.realEstate),
        navAdvertising: bs(z.nav.advertising, e.nav.advertising),
        navBranding: bs(z.nav.branding, e.nav.branding),
        navProperties: bs(z.nav.properties, e.nav.properties),
        navContact: bs(z.nav.contact, e.nav.contact),
        // common
        commonScrollHint: bs(z.common.scrollHint, e.common.scrollHint),
        commonComingSoon: bs(z.common.comingSoon, e.common.comingSoon),
        commonComingSoonDesc: bt(z.common.comingSoonDesc, e.common.comingSoonDesc),
        commonQuoteHint: bs(z.common.quoteHint, e.common.quoteHint),
        commonEst: bs(z.common.est, e.common.est),
        // footer
        footerDesc: bt(z.footer.desc, e.footer.desc),
        footerExplore: bs(z.footer.explore, e.footer.explore),
        footerServices: bs(z.footer.services, e.footer.services),
        footerLegal: bs(z.footer.legal, e.footer.legal),
        footerPrivacy: bs(z.footer.privacy, e.footer.privacy),
        footerCookies: bs(z.footer.cookies, e.footer.cookies),
        footerTerms: bs(z.footer.terms, e.footer.terms),
        footerRights: bs(z.footer.rights, e.footer.rights),
        footerSloganLine: bs(z.footer.sloganLine, e.footer.sloganLine),
    }
}

function buildSiteSettings(I: {zh: any; en: any}): any {
    const z = I.zh.contact
    const e = I.en.contact
    return {
        _id: 'siteSettings',
        _type: 'siteSettings',
        address: bs(z.addressV, e.addressV),
        phone: z.phoneV,
        email: z.emailV,
        whatsappNumber: '260964813736',
        workingHours: [
            {_key: nanoid(8), ...bs(z.hoursV1, e.hoursV1)!},
            {_key: nanoid(8), ...bs(z.hoursV2, e.hoursV2)!},
            {_key: nanoid(8), ...bs(z.hoursV3, e.hoursV3)!},
        ],
        socialLinks: [
            {_key: nanoid(8), platform: 'instagram', url: ''},
            {_key: nanoid(8), platform: 'facebook', url: ''},
            {_key: nanoid(8), platform: 'linkedin', url: ''},
            {_key: nanoid(8), platform: 'youtube', url: ''},
        ],
        ga4Id: '',
        metaPixelId: '',
        mapsEmbedUrl: '',
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
