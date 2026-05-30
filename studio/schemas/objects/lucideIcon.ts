import {defineType} from 'sanity'
import {LucideIconPicker} from '../../components/LucideIconPicker'

/* Stores a Lucide icon name (e.g. 'home', 'tv-minimal-play', 'sparkles').
 * Matches what the frontend's lucide.createIcons() reads from
 * <i data-lucide="...">. Custom input shows a searchable visual grid. */
export default defineType({
    name: 'lucideIcon',
    title: 'Icon',
    type: 'string',
    components: {
        input: LucideIconPicker,
    },
    preview: {
        select: {title: 'self'},
        prepare({title}: {title?: string}) {
            return {title: title || '(no icon)'}
        },
    },
})
