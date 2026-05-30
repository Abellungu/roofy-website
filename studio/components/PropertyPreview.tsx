import {useMemo} from 'react'
import {type PreviewProps, useClient} from 'sanity'
import imageUrlBuilder from '@sanity/image-url'
import {Card, Flex, Stack, Box, Text, Inline, Badge} from '@sanity/ui'

type ImageAsset = {_type?: string; asset?: {_ref?: string}} | undefined

function isImageAsset(x: unknown): x is ImageAsset {
    return !!x && typeof x === 'object' && 'asset' in (x as any) && !!(x as any).asset?._ref
}

/* Custom desk-list preview for `property` documents.
 * Renders a slate-950 + gold card echoing the frontend's property-card design,
 * so editors recognise listings visually instead of scanning raw titles. */
export function PropertyPreview(props: PreviewProps & {
    titleZh?: string
    titleEn?: string
    location?: string
    priceFormatted?: string
    category?: string
    placeholder?: boolean
    image?: unknown
}) {
    const titleZh = (props as any).titleZh as string | undefined
    const titleEn = (props as any).titleEn as string | undefined
    const location = (props as any).location as string | undefined
    const price = (props as any).priceFormatted as string | undefined
    const category = (props as any).category as string | undefined
    const placeholder = (props as any).placeholder as boolean | undefined
    const rawMedia = props.media as unknown

    const client = useClient({apiVersion: '2026-01-01'})
    const thumbUrl = useMemo(() => {
        if (!isImageAsset(rawMedia)) return null
        return imageUrlBuilder(client).image(rawMedia as any).width(160).height(160).fit('crop').url()
    }, [client, rawMedia])

    const title = titleEn || titleZh || '(untitled property)'
    const subtitle = titleZh && titleEn ? titleZh : ''

    return (
        <Card
            padding={2}
            radius={2}
            style={{
                background: '#0a0d16',
                borderLeft: '3px solid #FCD34D',
                color: '#e7e5e4',
            }}
        >
            <Flex gap={3} align="center">
                {/* Image thumb */}
                <Box style={{width: 80, height: 80, flexShrink: 0, overflow: 'hidden', borderRadius: 4}}>
                    {thumbUrl ? (
                        <img
                            src={thumbUrl}
                            alt={title}
                            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #11151f, #05070d)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FCD34D',
                                fontSize: 18,
                            }}
                        >
                            ◆
                        </div>
                    )}
                </Box>

                {/* Text + pills */}
                <Stack space={2} flex={1}>
                    <Inline space={2}>
                        {category && (
                            <Badge tone="primary" mode="default" fontSize={0}>
                                {category}
                            </Badge>
                        )}
                        {placeholder && (
                            <Badge tone="caution" mode="outline" fontSize={0}>
                                Sample
                            </Badge>
                        )}
                    </Inline>
                    <Text size={1} weight="semibold" style={{color: '#e7e5e4'}}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text size={0} style={{color: '#a8a29e'}}>
                            {subtitle}
                        </Text>
                    )}
                    <Inline space={3}>
                        {price && (
                            <Text size={1} style={{color: '#FCD34D', fontWeight: 600}}>
                                {price}
                            </Text>
                        )}
                        {location && (
                            <Text size={1} style={{color: '#a8a29e'}}>
                                · {location}
                            </Text>
                        )}
                    </Inline>
                </Stack>
            </Flex>
        </Card>
    )
}
