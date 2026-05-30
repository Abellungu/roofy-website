import {defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

/* A leadership team member. Rendered on /about.html#team. */
export default defineType({
    name: 'teamMember',
    title: 'Team member',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({type: 'teamMember'}),
        {
            name: 'slug',
            title: 'Slug (id)',
            type: 'slug',
            options: {source: 'name', maxLength: 60},
            validation: (Rule) => Rule.required(),
        },
        {name: 'name', title: 'Name (English)', type: 'string', validation: (Rule) => Rule.required()},
        {name: 'nameZh', title: '中文姓名 (optional)', type: 'string'},
        {name: 'role', title: 'Role', type: 'bilingualString', validation: (Rule) => Rule.required()},
        {
            name: 'initials',
            title: 'Initials (fallback when photo missing)',
            type: 'string',
            description: 'e.g. HA, AL — used as letters in the silhouette placeholder.',
            validation: (Rule) => Rule.max(3),
        },
        {
            name: 'photo',
            title: 'Headshot',
            type: 'image',
            options: {hotspot: true},
        },
        {name: 'bio', title: 'Short bio', type: 'bilingualText'},
    ],
    preview: {
        select: {title: 'name', subtitle: 'role.en', media: 'photo'},
    },
})
