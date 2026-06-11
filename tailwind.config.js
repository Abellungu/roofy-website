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
            fontFamily: {
                display: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif']
            }
        }
    }
};
