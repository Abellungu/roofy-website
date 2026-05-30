import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool} from '@sanity/presentation'

import {schemaTypes} from './schemas'
import {deskStructure} from './structure/deskStructure'
import {resolveSingletonActions} from './structure/singletonActions'
import {roofyTheme} from './theme/roofyTheme'

/* Read from .env.local — see .env.example. The Studio fails fast at boot if
 * SANITY_STUDIO_PROJECT_ID isn't set, which is the correct behaviour
 * (we want devs to know they need to set up Sanity before running). */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

/* Public site URL — used by the Presentation plugin to drive live preview. */
const SITE_URL =
    process.env.SANITY_STUDIO_PREVIEW_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000'
        : 'https://www.roofyinvestments.com')

export default defineConfig({
    name: 'roofy',
    title: 'ROOFY · 内容后台',
    projectId,
    dataset,

    theme: roofyTheme,

    plugins: [
        structureTool({
            structure: deskStructure,
        }),

        /* Live preview pane — clicking "Open in Presentation" on a document opens
         * the site URL in an iframe with editing overlays. */
        presentationTool({
            previewUrl: {
                origin: SITE_URL,
                preview: '/',
                draftMode: {
                    enable: '/?preview=1',
                },
                resolvers: {
                    /* property -> /properties/detail.html?id=<slug> */
                    /* pillar   -> /services/<slug>.html */
                    /* legalPage -> /<slug>.html */
                    /* teamMember -> /about.html#team-<slug> */
                },
            },
        }),

        /* GROQ playground — useful while iterating on queries. */
        visionTool({defaultApiVersion: '2026-01-01'}),
    ],

    schema: {
        types: schemaTypes,
        templates: (prev) =>
            /* Disallow creating duplicates of singletons via the global "new" button. */
            prev.filter((t) => !['siteContent', 'siteSettings'].includes(t.schemaType)),
    },

    document: {
        actions: resolveSingletonActions,
        newDocumentOptions: (prev, {creationContext}) => {
            /* Hide singletons from the global "new" menu. */
            if (creationContext.type === 'global') {
                return prev.filter((t) => !['siteContent', 'siteSettings'].includes(t.templateId))
            }
            return prev
        },
    },

})
