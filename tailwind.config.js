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
                    50: '#FBF3DC',
                    300: '#F7D976',
                    400: '#F2C53D',   // light gold — gradient top
                    500: '#E6AD15',   // primary gold (Kachinga spec 2026-06-23)
                    600: '#B5860C',   // dark gold — readable as text on white
                    700: '#8A6608'
                },
                slate: {
                    700: '#33427A',   // strong body text (navy-blue) on white
                    800: '#1E2A55',   // navy
                    900: '#121A3F',   // primary navy (Kachinga spec 2026-06-23) — dark sections, headings, nav
                    950: '#0C1230'    // deepest navy — footer
                },
                leaf: {
                    50: '#E4F2EA',
                    500: '#1C8C54',   // green accent — tags, sold-out, success
                    600: '#15784A'
                }
            },
            fontFamily: {
                display: ['Montserrat', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif'],
                sans: ['Montserrat', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif']
            }
        }
    }
};
