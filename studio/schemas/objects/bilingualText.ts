import {defineType} from 'sanity'
import {BilingualTextInput} from '../../components/BilingualInput'

/* Multi-line bilingual text. Used for hero descriptions, mission/vision body,
 * pillar summaries, property descriptions, intro paragraphs of legal pages. */
export default defineType({
    name: 'bilingualText',
    title: 'Bilingual text (zh / en)',
    type: 'object',
    fields: [
        {name: 'zh', title: '中文 ZH', type: 'text', rows: 4},
        {name: 'en', title: 'English EN', type: 'text', rows: 4},
    ],
    components: {
        input: BilingualTextInput,
    },
    preview: {
        select: {zh: 'zh', en: 'en'},
        prepare({zh, en}: {zh?: string; en?: string}) {
            const trim = (s?: string) => (s ? s.slice(0, 80) + (s.length > 80 ? '…' : '') : '')
            return {
                title: trim(zh) || trim(en) || '(empty)',
                subtitle: zh && en ? '' : zh ? '(en missing)' : '(zh missing)',
            }
        },
    },
})
