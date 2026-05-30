import {buildLegacyTheme} from 'sanity'

/* Studio theme mirroring the frontend: slate-950 ink + amber/gold accent,
 * Cinzel display for the brand title. Sanity exposes a limited theme API —
 * we set the major surface + accent colors and let everything else inherit. */
const ink = {
    bg950: '#05070d',
    bg900: '#0a0d16',
    bg800: '#11151f',
    bg700: '#1a1f2c',
    bg600: '#262b39',
    text: '#e7e5e4',
    muted: '#a8a29e',
}

const gold = {
    main: '#FCD34D', // gold-300
    bright: '#FBBF24', // gold-400
    dark: '#B45309', // gold-700
}

const props = {
    '--my-white-color': ink.text,
    '--my-black-color': ink.bg950,

    '--my-bg-color': ink.bg950,
    '--my-text-color': ink.text,

    '--my-state-info-color': gold.main,
    '--my-state-success-color': '#10B981',
    '--my-state-warning-color': gold.bright,
    '--my-state-danger-color': '#EF4444',

    '--my-default-button-color': ink.bg800,
    '--my-default-button-primary-color': gold.main,
    '--my-default-button-success-color': '#10B981',
    '--my-default-button-warning-color': gold.bright,
    '--my-default-button-danger-color': '#EF4444',

    '--my-main-navigation-color': ink.bg900,
    '--my-main-navigation-color--inverted': ink.text,

    '--my-focus-color': gold.main,
}

export const roofyTheme = buildLegacyTheme({
    ...props,
})
