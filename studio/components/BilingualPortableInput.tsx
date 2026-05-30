import {type ObjectInputProps} from 'sanity'
import {Card, Text, Box, Stack} from '@sanity/ui'

/* Side-by-side rich-text editor for `bilingualPortable` fields.
 *
 * Strategy: delegate to Sanity's default object rendering (which produces two
 * stacked PortableTextEditor instances for `zh` and `en` children), and
 * override the layout via CSS Grid so they appear side by side on wide screens
 * and stack vertically on narrow ones. Cleaner + more maintainable than
 * re-implementing PortableText.
 *
 * Each child field already shows its own `中文 ZH` / `English EN` title via
 * the schema's child `title` property. */
export function BilingualPortableInput(props: ObjectInputProps) {
    return (
        <Card padding={0} radius={2}>
            <Stack space={3}>
                <Box padding={3}>
                    <Text size={1} muted>
                        Bilingual rich text · 中英对照
                    </Text>
                </Box>
                <Box
                    style={{
                        display: 'grid',
                        gap: '1rem',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                    }}
                >
                    {props.renderDefault(props)}
                </Box>
            </Stack>
        </Card>
    )
}
