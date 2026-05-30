import {defineType} from 'sanity'
import {BilingualInput} from '../../components/BilingualInput'

/* Single-line bilingual string. The canonical translatable-field type for the
 * whole site — every title, label, eyebrow, button text uses this. */
export default defineType({
    name: 'bilingualString',
    title: 'Bilingual string (zh / en)',
    type: 'object',
    fields: [
        {
            name: 'zh',
            title: '中文 ZH',
            type: 'string',
        },
        {
            name: 'en',
            title: 'English EN',
            type: 'string',
        },
    ],
    components: {
        input: BilingualInput,
    },
    preview: {
        select: {zh: 'zh', en: 'en'},
        prepare({zh, en}) {
            const title = zh || en || '(empty)'
            const subtitle = zh && en ? '' : zh ? '(en missing)' : '(zh missing)'
            return {title, subtitle}
        },
    },
    validation: (Rule) =>
        Rule.custom((val: {zh?: string; en?: string} | undefined) => {
            if (!val) return true
            const hasZh = !!val.zh?.trim()
            const hasEn = !!val.en?.trim()
            if (hasZh && !hasEn) return 'English translation missing'
            if (hasEn && !hasZh) return '缺少中文翻译'
            return true
        }),
})
