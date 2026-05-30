import {Card, Stack, Box, Text, Heading} from '@sanity/ui'
import {InfoOutlineIcon} from '@sanity/icons'
import brandVoiceContent from './brandVoice.md?raw'

/* Static read-only sidebar showing ROOFY's brand voice / red-line rules.
 * Rendered via studio.components.layout in sanity.config.ts.
 * Pure markdown viewer — no patching, no async state. */

/* Minimal markdown → JSX. Handles headings, bullets, **bold**, --- rules,
 * blank-line paragraphs. */
function renderMarkdown(md: string) {
    const lines = md.split('\n')
    const nodes: React.ReactNode[] = []
    let listBuffer: string[] = []
    let key = 0

    const flushList = () => {
        if (listBuffer.length === 0) return
        nodes.push(
            <Box key={`list-${key++}`} paddingLeft={3}>
                <Stack space={2}>
                    {listBuffer.map((item, i) => (
                        <Text key={i} size={1}>
                            <span style={{color: '#FCD34D', marginRight: 6}}>·</span>
                            {renderInline(item)}
                        </Text>
                    ))}
                </Stack>
            </Box>,
        )
        listBuffer = []
    }

    for (const raw of lines) {
        const line = raw.trimEnd()
        if (line.startsWith('# ')) {
            flushList()
            nodes.push(
                <Heading key={key++} size={2} style={{color: '#FCD34D'}}>
                    {line.slice(2)}
                </Heading>,
            )
        } else if (line.startsWith('## ')) {
            flushList()
            nodes.push(
                <Heading key={key++} size={1} style={{color: '#e7e5e4', marginTop: 12}}>
                    {line.slice(3)}
                </Heading>,
            )
        } else if (/^\d+\.\s+/.test(line)) {
            flushList()
            const num = line.match(/^(\d+)\.\s+(.*)/)
            if (num) {
                nodes.push(
                    <Text key={key++} size={1} weight="semibold">
                        <span style={{color: '#FCD34D', marginRight: 6}}>{num[1]}.</span>
                        {renderInline(num[2])}
                    </Text>,
                )
            }
        } else if (line.startsWith('- ')) {
            listBuffer.push(line.slice(2))
        } else if (line === '---') {
            flushList()
            nodes.push(
                <Box
                    key={key++}
                    style={{height: 1, background: 'rgba(252,211,77,0.25)', margin: '12px 0'}}
                />,
            )
        } else if (line === '') {
            flushList()
        } else {
            flushList()
            nodes.push(
                <Text key={key++} size={1} muted>
                    {renderInline(line)}
                </Text>,
            )
        }
    }
    flushList()
    return nodes
}

function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = []
    let remaining = text
    let i = 0
    while (remaining.length > 0) {
        const boldMatch = remaining.match(/^([^*`]*)\*\*([^*]+)\*\*(.*)$/)
        const codeMatch = remaining.match(/^([^`*]*)`([^`]+)`(.*)$/)
        if (boldMatch) {
            if (boldMatch[1]) parts.push(boldMatch[1])
            parts.push(
                <strong key={i++} style={{color: '#FCD34D'}}>
                    {boldMatch[2]}
                </strong>,
            )
            remaining = boldMatch[3]
        } else if (codeMatch) {
            if (codeMatch[1]) parts.push(codeMatch[1])
            parts.push(
                <code
                    key={i++}
                    style={{
                        background: '#11151f',
                        padding: '1px 4px',
                        borderRadius: 3,
                        fontSize: '0.9em',
                        color: '#FCD34D',
                    }}
                >
                    {codeMatch[2]}
                </code>,
            )
            remaining = codeMatch[3]
        } else {
            parts.push(remaining)
            remaining = ''
        }
    }
    return parts
}

export function BrandVoiceSidebar({renderDefault, ...props}: any) {
    return (
        <>
            {renderDefault(props)}
            <Card
                padding={4}
                radius={2}
                style={{
                    position: 'fixed',
                    right: 16,
                    bottom: 16,
                    width: 360,
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    zIndex: 100,
                    background: '#05070d',
                    border: '1px solid rgba(252,211,77,0.4)',
                    color: '#e7e5e4',
                    fontFamily: "'Josefin Sans', 'Noto Sans SC', system-ui, sans-serif",
                }}
            >
                <Stack space={3}>
                    <Stack space={2}>
                        <Box style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <InfoOutlineIcon style={{color: '#FCD34D'}} />
                            <Text size={1} weight="semibold" style={{color: '#FCD34D'}}>
                                Brand voice · 品牌守则
                            </Text>
                        </Box>
                    </Stack>
                    <Stack space={2}>{renderMarkdown(brandVoiceContent)}</Stack>
                </Stack>
            </Card>
        </>
    )
}
