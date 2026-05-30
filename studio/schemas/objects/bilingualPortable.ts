import {defineType, defineArrayMember} from 'sanity'
import {BilingualPortableInput} from '../../components/BilingualPortableInput'

/* Rich-text bilingual content for narrative bodies (pillar narratives) and
 * legal section bodies. Two parallel arrays of portable-text blocks. */
const blockArrayConfig = {
    type: 'array' as const,
    of: [
        defineArrayMember({
            type: 'block',
            styles: [
                {title: 'Normal', value: 'normal'},
                {title: 'H3', value: 'h3'},
                {title: 'H4', value: 'h4'},
            ],
            lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Numbered', value: 'number'},
            ],
            marks: {
                decorators: [
                    {title: 'Strong', value: 'strong'},
                    {title: 'Emphasis', value: 'em'},
                ],
                annotations: [
                    {
                        name: 'link',
                        type: 'object',
                        title: 'Link',
                        fields: [{name: 'href', type: 'string', title: 'URL'}],
                    },
                ],
            },
        }),
    ],
}

export default defineType({
    name: 'bilingualPortable',
    title: 'Bilingual rich text (zh / en)',
    type: 'object',
    fields: [
        {name: 'zh', title: '中文 ZH', ...blockArrayConfig},
        {name: 'en', title: 'English EN', ...blockArrayConfig},
    ],
    components: {
        input: BilingualPortableInput,
    },
})
