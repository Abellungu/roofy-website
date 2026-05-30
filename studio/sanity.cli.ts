import {defineCliConfig} from 'sanity/cli'

/* CLI config — values come from .env.local (gitignored).
 * Run `sanity init` once on a fresh machine to populate these, then commit
 * the projectId/dataset constants below by replacing process.env reads. */
export default defineCliConfig({
    api: {
        projectId: process.env.SANITY_STUDIO_PROJECT_ID || '__SET_IN_ENV__',
        dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    },
    /* Custom domain `cms.roofyinvestments.com` is set up at the Cloudflare Pages
     * level; this `studioHost` is the fallback `<host>.sanity.studio` name. */
    studioHost: 'roofy-investments',
    autoUpdates: true,
})
