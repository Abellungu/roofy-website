# ROOFY · Sanity Studio

CMS for the Roofy Investments Zambia corporate portal at [www.roofyinvestments.com](https://www.roofyinvestments.com).
The Studio source lives here in `studio/`; the public site lives in the sibling `site/` directory.

> **State of play.** All Studio source code is committed. The actual Sanity project, API token, and DNS still need to be set up by ROOFY before the Studio can be deployed.

---

## What this is

A custom Sanity Studio with:

- **6 document types**: `property` · `teamMember` · `pillar` · `legalPage` · `siteContent` (singleton) · `siteSettings` (singleton).
- **6 custom React inputs** matching ROOFY's editing workflow:
  - **Bilingual side-by-side editor** (left 中文 ZH, right English EN, with "duplicate" buttons + char counts) — used by every translatable field.
  - **Bilingual rich-text editor** (two PortableText editors side by side) for legal-section bodies and pillar narratives.
  - **Structured price input** (number + currency + period + canonical preview) to replace free-text strings like `"K30,000/month"`.
  - **Lucide icon picker** (searchable visual grid).
  - **Property preview** (slate-950 + gold card in document lists, echoing the live site).
  - **Brand-voice sidebar** (floating help panel pulling rules from `components/brandVoice.md`).
- **Branded slate-950 + amber-gold theme** matching the live site.
- **Chinese-friendly desk structure** (网站内容 / 公司设置 / 房源 / 团队 / 业务 / 法律).
- **Migration script** (`migrate/from-json.ts`) that one-shot imports the current Phase 2 JSON content + images into Sanity.
- **Pull scripts** (`migrate/pull-i18n.ts` + `migrate/pull-data.ts`) that regenerate the static frontend's bundled JSON/JS from Sanity at build time, so the public site stays zero-build, cache-friendly, free-tier-safe.

## Prerequisites (client side — AI cannot do these)

1. **Sanity account** — visit [sanity.io](https://www.sanity.io) and create one (free).
2. **Sanity project** — at [sanity.io/manage](https://www.sanity.io/manage) create a new project named **roofy-investments**. Note the `projectId` (looks like `abc123de`).
3. **Dataset** — accept the default `production`. Optionally create a `staging` dataset for testing.
4. **API token** — at the project's *API → Tokens* page, create an **Editor**-scoped token. Copy the value once (you can't see it again).
5. **CORS** — at *API → CORS Origins*, add:
   - `http://localhost:3333` (local Studio dev)
   - `https://cms.roofyinvestments.com` (production Studio domain)
   - `https://www.roofyinvestments.com` (preview iframe origin)
6. **Free-tier user selection** — invite up to 3 editors. Recommended seats:
   - **CEO (Huang Aibing)** — approval / publish rights
   - **Marketing Assistant (Kachinga Jnr)** — daily editor
   - **Shared `sales@`** — covers Sales Supervisor + Admin Supervisor

---

## Local setup

```bash
cd studio
npm install                    # installs Sanity + React + Lucide etc.
cp .env.example .env.local     # fill in projectId + token
npm run dev                    # local Studio at http://localhost:3333
```

`.env.local` template:

```bash
SANITY_STUDIO_PROJECT_ID=<from step 2>
SANITY_STUDIO_DATASET=production
SANITY_AUTH_TOKEN=<from step 4>
SANITY_STUDIO_PREVIEW_URL=https://www.roofyinvestments.com
```

When `sanity dev` runs, it opens the Studio in your browser. First-time login uses your Sanity account — same one that owns the project.

---

## First-time migration

After Studio is running locally and you've confirmed you can log in:

```bash
cd studio
npm run migrate:dry        # prints what would be written (no API calls)
npm run migrate            # actually uploads 13 images + writes 20 documents
```

The migration is idempotent — re-running it overwrites all docs to match the JSON files (useful for re-syncing after a JSON edit, but normally you stop running it once you're editing in Studio).

Verify in Sanity dashboard (or in the Studio):
- 6 `property` docs (Kalundu, Lusaka West, Kingsland 5-bed, Ibex 16 units, Elev8, Ibex Hill 4-bed)
- 6 `teamMember` docs
- 3 `pillar` docs (real-estate / advertising / branding)
- 3 `legalPage` docs (privacy / cookies / terms)
- `siteContent` singleton with ~70 fields populated
- `siteSettings` singleton with phone / email / address / WhatsApp number

---

## Daily workflow

Editors:

1. Visit [cms.roofyinvestments.com](https://cms.roofyinvestments.com) (or `localhost:3333` in dev).
2. Edit content in the Studio. Changes save automatically.
3. The site rebuilds within ~3 minutes (Sanity webhook → Cloudflare Pages deploy hook).

Developers (occasional, when content shape changes):

```bash
cd studio
npm run pull:i18n          # regenerate site/assets/js/{i18n,settings}.js from Sanity
npm run pull:data          # regenerate site/assets/data/*.json from Sanity
npm run pull               # both
```

These two scripts also run automatically in the production build pipeline.

---

## Deployment

### Studio → `cms.roofyinvestments.com`

```bash
cd studio
npm run build              # produces studio/dist/
```

Deploy `studio/dist/` to Cloudflare Pages (or Netlify / Vercel). Connect the custom domain `cms.roofyinvestments.com` and add the `CNAME` record in DNS.

Fallback: `npm run deploy` deploys to Sanity's free hosted Studio at `roofy-investments.sanity.studio`. Use this if the branded subdomain isn't set up yet.

### Public site → `www.roofyinvestments.com`

The static site in `site/` continues to deploy as before. Add this build command on Cloudflare Pages / Netlify so content pulls happen automatically:

```bash
# Build command
cd studio && npm install && npm run pull && cd ..

# Output directory
site/
```

Add a **Sanity webhook** (Sanity dashboard → API → Webhooks):
- **URL**: your Cloudflare Pages deploy hook (Cloudflare → Pages project → Settings → Builds & deployments → Deploy hooks)
- **Trigger on**: Create / Update / Delete
- **Filter**: `_type in ["property","teamMember","pillar","legalPage","siteContent","siteSettings"]`

Now every save in the Studio triggers a site rebuild.

---

## Project layout

```
studio/
├── sanity.config.ts                main Studio config (plugins, theme, structure)
├── sanity.cli.ts                   CLI config (projectId / dataset)
├── package.json
├── tsconfig.json
├── .env.example                    template — copy to .env.local
├── .gitignore
├── schemas/
│   ├── index.ts                    exports schemaTypes
│   ├── objects/                    field-level reusable types (bilingual*, price, lucideIcon, legalSection, cookieRow)
│   └── documents/                  document types (property, teamMember, pillar, legalPage, siteContent, siteSettings)
├── components/                     custom React inputs + previews
├── structure/
│   ├── deskStructure.ts            Chinese-labelled navigation
│   └── singletonActions.ts         hide duplicate/delete for singletons
├── theme/
│   └── roofyTheme.ts               slate + amber tokens
└── migrate/
    ├── from-json.ts                one-shot: JSON + images → Sanity
    ├── pull-i18n.ts                build-time: Sanity → site/assets/js/{i18n,settings}.js
    └── pull-data.ts                build-time: Sanity → site/assets/data/*.json
```

---

## Troubleshooting

**Studio fails to load with "projectId required" error**
→ `.env.local` is missing or `SANITY_STUDIO_PROJECT_ID` is blank. Verify file location is `studio/.env.local`.

**Migration script complains "SANITY_AUTH_TOKEN is not set"**
→ The migration script needs an **Editor** token (not anonymous). Create one in Sanity dashboard → API → Tokens.

**Studio loads but custom components show empty boxes**
→ React / @sanity/ui versions may have drifted. Run `npm install` in `studio/` to pin them.

**Property images don't load**
→ The migration uploaded them to Sanity. If you're running locally without an internet connection, the CDN URLs won't resolve. Use `cdn.sanity.io` via VPN if needed.

**Brand-voice sidebar covers the form**
→ It's `position: fixed`. Adjust `BrandVoiceSidebar.tsx` if it becomes annoying, or hide it for specific users via the layout component.

---

## References

- [Sanity Studio v3 docs](https://www.sanity.io/docs/studio)
- [GROQ language](https://www.sanity.io/docs/groq)
- [Presentation tool](https://www.sanity.io/docs/presentation)
- ROOFY plan file: `~/.claude/plans/roofy-roofy-zambia-website-brief-1-docx-resilient-eclipse.md`
- Brand voice rules: `studio/components/brandVoice.md`
