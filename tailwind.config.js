/* Build-time Tailwind config for the static site.
 * Replaces the former cdn.tailwindcss.com runtime + identical inline config
 * that every page carried (removed 2026-06-11 for China-side reachability).
 *
 * Rebuild after adding new utility classes in HTML/JS:
 *   npx -y tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css \
 *       -o site/assets/css/tailwind.css --minify
 */
module.exports = {
    content: [
        './site/**/*.html',
        './site/assets/js/*.js'
    ],
    theme: {
        extend: {
            /* ── Brand palette (premium redesign 2026-06-29) ──
             * Champagne gold + navy on an off-white base. No black anywhere
             * (Zambian cultural sensitivity): near-black is mapped to navy.
             * We override Tailwind's `amber` (→ champagne gold) and `slate`
             * (dark end → navy, light end → off-white) so existing utility
             * classes recolour site-wide without a find/replace.
             * Accessibility: gold is for fills / squares / underlines / icons,
             * gold text only sits on navy — never small gold text on light. */
            colors: {
                amber: {
                    50: '#F7F1E4',
                    300: '#E2CFA0',
                    400: '#D8BC82',   // light champagne — gradient top / hover
                    500: '#C8A45A',   // primary champagne gold (designer spec)
                    600: '#A07E3C',   // dark gold — readable as text on light
                    700: '#7A5E2C'
                },
                slate: {
                    50: '#F8F8F6',    // off-white — primary page surface
                    100: '#F1F0EC',   // off-white tint — subtle bands
                    200: '#E4E2DB',   // hairline divider on off-white
                    700: '#2E3A5C',   // strong body text (navy-blue) on light
                    800: '#16213F',   // navy — dark blocks
                    900: '#0C1630',   // primary navy (designer) — hero, headings, nav
                    950: '#080C20'    // deepest navy — footer base / overlays
                },
                leaf: {
                    50: '#E4F2EA',
                    500: '#1C8C54',   // green — sold-out / success status, used sparingly
                    600: '#15784A'
                }
            },
            fontFamily: {
                /* Display = Cormorant Garamond serif (latin only); Chinese
                 * headings fall back to bold sans (PingFang etc.), matching the
                 * prior latin-serif rule. Body = Inter. Both self-hosted. */
                display: ['"Cormorant Garamond"', 'Georgia', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'serif'],
                serif: ['"Cormorant Garamond"', 'Georgia', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'serif'],
                sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif']
            },
            borderRadius: {
                /* Sharp, right-angle component language (client direction).
                 * Everything squares off; only true circles keep `full`. */
                'none': '0',
                'sm': '0',
                DEFAULT: '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                '3xl': '0',
                'full': '9999px'
            }
        }
    }
};
