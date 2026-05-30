import {useCallback} from 'react'
import {set, unset, type ObjectInputProps} from 'sanity'
import {Card, Flex, Stack, Box, TextInput, TextArea, Button, Text, Inline} from '@sanity/ui'
import {CopyIcon} from '@sanity/icons'

type BilingualValue = {zh?: string; en?: string} | undefined

/* Side-by-side bilingual input. Renders left zh / right en columns with char
 * counts and a Duplicate button between them. Used by `bilingualString` (line)
 * and `bilingualText` (textarea) types. */
function BilingualBase({
    multiline,
    rows = 4,
    ...props
}: ObjectInputProps<BilingualValue> & {multiline?: boolean; rows?: number}) {
    const {value, onChange} = props

    const patchSide = useCallback(
        (side: 'zh' | 'en', next: string) => {
            const otherSide = side === 'zh' ? 'en' : 'zh'
            const otherVal = value?.[otherSide] ?? ''
            if (!next && !otherVal) {
                onChange(unset())
                return
            }
            const nextObj: {zh?: string; en?: string} = {}
            if (next) nextObj[side] = next
            if (otherVal) nextObj[otherSide] = otherVal
            onChange(set(nextObj))
        },
        [value, onChange],
    )

    const duplicate = useCallback(
        (from: 'zh' | 'en') => {
            const src = value?.[from] ?? ''
            if (!src) return
            const target = from === 'zh' ? 'en' : 'zh'
            patchSide(target, src)
        },
        [value, patchSide],
    )

    const zh = value?.zh ?? ''
    const en = value?.en ?? ''

    const InputEl = (multiline ? TextArea : TextInput) as any

    return (
        <Card padding={0} radius={2}>
            <Flex gap={2} align="stretch" wrap="wrap">
                {/* ZH column */}
                <Box flex={1} style={{minWidth: 240}}>
                    <Stack space={2}>
                        <Inline space={2}>
                            <Text size={1} weight="semibold" muted>
                                中文 · ZH
                            </Text>
                            <Text size={0} muted>
                                {zh.length} {multiline ? 'chars' : 'chars'}
                            </Text>
                        </Inline>
                        <InputEl
                            value={zh}
                            rows={multiline ? rows : undefined}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                patchSide('zh', e.currentTarget.value)
                            }
                            placeholder="（中文）"
                            style={multiline ? {resize: 'vertical', minHeight: 80} : undefined}
                        />
                        <Button
                            mode="ghost"
                            tone="primary"
                            fontSize={1}
                            padding={2}
                            icon={CopyIcon}
                            text="复制 → English"
                            disabled={!zh}
                            onClick={() => duplicate('zh')}
                        />
                    </Stack>
                </Box>

                {/* EN column */}
                <Box flex={1} style={{minWidth: 240}}>
                    <Stack space={2}>
                        <Inline space={2}>
                            <Text size={1} weight="semibold" muted>
                                English · EN
                            </Text>
                            <Text size={0} muted>
                                {en.length} chars
                            </Text>
                        </Inline>
                        <InputEl
                            value={en}
                            rows={multiline ? rows : undefined}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                patchSide('en', e.currentTarget.value)
                            }
                            placeholder="(English)"
                            style={multiline ? {resize: 'vertical', minHeight: 80} : undefined}
                        />
                        <Button
                            mode="ghost"
                            tone="primary"
                            fontSize={1}
                            padding={2}
                            icon={CopyIcon}
                            text="Copy → 中文"
                            disabled={!en}
                            onClick={() => duplicate('en')}
                        />
                    </Stack>
                </Box>
            </Flex>
        </Card>
    )
}

export function BilingualInput(props: ObjectInputProps<BilingualValue>) {
    return <BilingualBase {...props} multiline={false} />
}

export function BilingualTextInput(props: ObjectInputProps<BilingualValue>) {
    return <BilingualBase {...props} multiline={true} rows={4} />
}
