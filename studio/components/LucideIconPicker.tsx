import {useCallback, useMemo, useState} from 'react'
import {set, unset, type StringInputProps} from 'sanity'
import {Card, Stack, Flex, Box, TextInput, Button, Text, Grid, Tooltip} from '@sanity/ui'
import * as LucideIcons from 'lucide-react'

/* List of curated icon names available to the picker.
 * (Lucide ships ~1500; for a CMS the common 100 are plenty + faster.) */
const COMMON_ICONS = [
    // brand / identity
    'home', 'building', 'building-2', 'landmark', 'castle', 'warehouse', 'store', 'factory',
    'briefcase', 'building-office', 'tree-deciduous', 'tree-palm',
    // tech / media
    'tv-minimal-play', 'tv', 'monitor', 'monitor-play', 'monitor-smartphone', 'camera', 'video',
    'image', 'images', 'film', 'megaphone', 'radio', 'newspaper', 'qr-code', 'shopping-bag',
    'shopping-cart', 'tag', 'tags', 'gift',
    // travel / location
    'plane', 'plane-takeoff', 'plane-landing', 'map', 'map-pin', 'navigation', 'globe', 'compass',
    'route', 'flag', 'flag-triangle-right', 'mountain', 'sun', 'sunrise', 'sunset', 'cloud',
    // people / team
    'users', 'user', 'user-check', 'user-cog', 'user-plus', 'handshake', 'heart-handshake',
    'crown', 'star', 'award', 'trophy',
    // values / actions
    'lightbulb', 'lightbulb-off', 'sparkles', 'shield', 'shield-check', 'shield-alert', 'check',
    'check-circle', 'check-circle-2', 'circle-check-big', 'flame', 'gem', 'diamond', 'medal',
    // commerce / data
    'trending-up', 'trending-down', 'bar-chart', 'bar-chart-3', 'line-chart', 'pie-chart',
    'activity', 'zap', 'rocket', 'target',
    // contact
    'phone', 'phone-call', 'mail', 'message-circle', 'message-square', 'send', 'inbox',
    // ux glyphs
    'arrow-up-right', 'arrow-right', 'arrow-down-right', 'arrow-left', 'arrow-down', 'arrow-up',
    'plus', 'minus', 'x', 'search', 'search-x', 'menu', 'more-horizontal', 'settings', 'sliders',
    'filter', 'refresh-ccw', 'rotate-ccw', 'languages',
    // services-specific
    'key-round', 'key', 'lock', 'unlock', 'package', 'truck', 'pen-tool', 'wand', 'wand-sparkles',
    'paintbrush', 'palette', 'type', 'bookmark', 'book-open',
    // cookie / legal
    'cookie', 'file-text', 'shield-question', 'info', 'help-circle', 'quote', 'clock', 'calendar',
    // social
    'instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'github',
] as const

/* Convert kebab-case ('arrow-up-right') to PascalCase ('ArrowUpRight') for the
 * lucide-react import lookup. */
function pascal(name: string): string {
    return name
        .split('-')
        .map((p) => p[0]?.toUpperCase() + p.slice(1))
        .join('')
}

function getLucideComponent(name: string): React.ComponentType<{size?: number}> | null {
    const Comp = (LucideIcons as Record<string, any>)[pascal(name)]
    return typeof Comp === 'function' ? Comp : null
}

/* Searchable Lucide icon picker. Stores the kebab-case icon name as a plain
 * string — matches what `<i data-lucide="...">` in the frontend consumes. */
export function LucideIconPicker(props: StringInputProps) {
    const {value, onChange} = props
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        if (!query.trim()) return COMMON_ICONS
        const q = query.trim().toLowerCase()
        return COMMON_ICONS.filter((n) => n.includes(q))
    }, [query])

    const pick = useCallback(
        (name: string) => {
            onChange(value === name ? unset() : set(name))
        },
        [value, onChange],
    )

    const Selected = value ? getLucideComponent(value) : null

    return (
        <Card padding={3} radius={2} shadow={1}>
            <Stack space={3}>
                {/* Current selection */}
                <Flex gap={3} align="center">
                    <Box>
                        <Card
                            padding={3}
                            radius={2}
                            tone="primary"
                            style={{
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {Selected ? <Selected size={28} /> : <Text muted>—</Text>}
                        </Card>
                    </Box>
                    <Stack space={2} flex={1}>
                        <Text size={1} weight="semibold">
                            {value || '(no icon selected)'}
                        </Text>
                        <Text size={0} muted>
                            Click a tile below to set. Click again to clear.
                        </Text>
                    </Stack>
                </Flex>

                {/* Search */}
                <TextInput
                    placeholder="Search icons (e.g. shield, arrow, building)…"
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                />

                {/* Grid */}
                <Box style={{maxHeight: 320, overflowY: 'auto'}}>
                    <Grid columns={[6, 8, 10]} gap={1}>
                        {filtered.map((name) => {
                            const Comp = getLucideComponent(name)
                            if (!Comp) return null
                            const active = value === name
                            return (
                                <Tooltip key={name} content={<Text size={1}>{name}</Text>} placement="top">
                                    <Button
                                        mode={active ? 'default' : 'ghost'}
                                        tone={active ? 'primary' : 'default'}
                                        padding={2}
                                        onClick={() => pick(name)}
                                        aria-label={name}
                                    >
                                        <Comp size={18} />
                                    </Button>
                                </Tooltip>
                            )
                        })}
                    </Grid>
                </Box>
                {filtered.length === 0 && (
                    <Text size={1} muted>
                        No icons match "{query}". Try a shorter keyword.
                    </Text>
                )}
            </Stack>
        </Card>
    )
}
