import type {DocumentActionComponent} from 'sanity'

/* Hides duplicate / delete / discard-changes actions for singleton documents. */
const SINGLETON_TYPES = new Set(['siteContent', 'siteSettings'])

export function resolveSingletonActions(
    input: DocumentActionComponent[],
    context: {schemaType: string},
): DocumentActionComponent[] {
    if (!SINGLETON_TYPES.has(context.schemaType)) return input
    return input.filter(({action}) => !action || !['unpublish', 'delete', 'duplicate'].includes(action))
}
