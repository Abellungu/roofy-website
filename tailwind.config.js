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
            /* ── Brand palette (2026-06-13) ──
             * Primary = golden yellow, secondary = deep navy, accent = green.
             * No black anywhere (Zambian cultural sensitivity): the near-black
             * slate darks are remapped to navy. We override specific shades of
             * Tailwind's built-in `amber` (→ gold) and `slate` (dark end → navy)
             * so the existing utility classes recolour site-wide without a
             * find/replace; light slate shades keep their near-white values.
             * Accessibility: gold is for fills / squares / underlines / icons,
             * never small text on white — gold text only sits on navy. */
            colors: {
                amber: {
                    50: '#FEF6E0',
                    300: '#FCD24A',
                    400: '#FBC22E',
                    500: '#F5B301',   // primary gold (hero band, CTAs, stripe)
                    600: '#C2870A',   // dark gold — readable as text on white
                    700: '#9A6B07'
                },
                slate: {
                    700: '#2E4F78',   // strong body text (navy-blue)
                    800: '#1A3A63',   // navy
                    900: '#102A4C',   // primary navy — dark sections, headings, nav (bluer/more vivid)
                    950: '#0A2342'    // deepest navy — footer
                },
                leaf: {
                    50: '#E4F2EA',
                    500: '#1C8C54',   // green accent — tags, sold-out, success
                    600: '#15784A'
                }
            },
            fontFamily: {
                display: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif']
            }
        }
    }
};
