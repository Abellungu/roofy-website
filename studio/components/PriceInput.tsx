import {useCallback} from 'react'
import {set, type ObjectInputProps} from 'sanity'
import {Card, Stack, Flex, Box, Select, TextInput, Switch, Text, Inline, Badge} from '@sanity/ui'

type PriceValue =
    | {
          amount?: number
          amountMax?: number
          currency?: 'USD' | 'ZMW'
          period?: 'month' | 'total' | 'per-night' | 'request'
          negotiable?: boolean
          formatted?: string
          note?: {zh?: string; en?: string}
      }
    | undefined

function formatNumber(n?: number): string {
    if (n == null || Number.isNaN(n)) return ''
    return Number(n).toLocaleString('en-US')
}

function symbolFor(currency?: string): string {
    return currency === 'ZMW' ? 'K' : currency === 'USD' ? '$' : ''
}

function periodSuffix(period?: string): string {
    if (period === 'month') return ' / month'
    if (period === 'per-night') return ' / night'
    return ''
}

function buildFormatted(v: NonNullable<PriceValue>): string {
    if (v.period === 'request') return 'Price on request'
    const sym = symbolFor(v.currency)
    if (v.amount == null) return ''
    const main = `${sym} ${formatNumber(v.amount)}`
    const range = v.amountMax ? ` – ${sym} ${formatNumber(v.amountMax)}` : ''
    const negotiable = v.negotiable ? ' · Negotiable' : ''
    return `${main}${range}${periodSuffix(v.period)}${negotiable}`.trim()
}

/* Structured price input. Replaces ad-hoc free-text price strings. The
 * `formatted` field is recomputed on every patch and stored as canonical
 * truth — frontend renders directly from it. */
export function PriceInput(props: ObjectInputProps<PriceValue>) {
    const {value, onChange} = props
    const period = value?.period ?? 'total'
    const isRequest = period === 'request'

    const patch = useCallback(
        (next: NonNullable<PriceValue>) => {
            const formatted = buildFormatted(next)
            onChange(set({...next, formatted}))
        },
        [onChange],
    )

    const update = useCallback(
        <K extends keyof NonNullable<PriceValue>>(key: K, newVal: NonNullable<PriceValue>[K]) => {
            const merged = {...(value || {}), [key]: newVal} as NonNullable<PriceValue>
            if (merged.period === 'request') {
                merged.amount = undefined
                merged.amountMax = undefined
                merged.currency = undefined
                merged.negotiable = undefined
            }
            patch(merged)
        },
        [value, patch],
    )

    const updateNote = useCallback(
        (side: 'zh' | 'en', s: string) => {
            const currentNote = value?.note || {}
            const nextNote: {zh?: string; en?: string} = {...currentNote}
            if (s) nextNote[side] = s
            else delete nextNote[side]
            const hasContent = nextNote.zh || nextNote.en
            update('note', hasContent ? nextNote : undefined)
        },
        [value, update],
    )

    return (
        <Card padding={3} radius={2} shadow={1}>
            <Stack space={4}>
                {/* Period */}
                <Stack space={2}>
                    <Text size={1} weight="semibold" muted>
                        Period · 计价方式
                    </Text>
                    <Select
                        value={period}
                        onChange={(e) =>
                            update('period', e.currentTarget.value as NonNullable<PriceValue>['period'])
                        }
                    >
                        <option value="total">Total · 总价</option>
                        <option value="month">Per month · 月租</option>
                        <option value="per-night">Per night · 每晚</option>
                        <option value="request">Price on request · 价格面议</option>
                    </Select>
                </Stack>

                {/* Amount + currency (hidden when period === request) */}
                {!isRequest && (
                    <Flex gap={2} align="flex-end" wrap="wrap">
                        <Box flex={1} style={{minWidth: 140}}>
                            <Stack space={2}>
                                <Text size={1} weight="semibold" muted>
                                    Amount · 金额
                                </Text>
                                <TextInput
                                    type="number"
                                    value={value?.amount?.toString() ?? ''}
                                    onChange={(e) =>
                                        update(
                                            'amount',
                                            e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
                                        )
                                    }
                                    placeholder="30000"
                                />
                            </Stack>
                        </Box>
                        <Box flex={1} style={{minWidth: 140}}>
                            <Stack space={2}>
                                <Text size={1} weight="semibold" muted>
                                    Range upper bound · 上限（可选）
                                </Text>
                                <TextInput
                                    type="number"
                                    value={value?.amountMax?.toString() ?? ''}
                                    onChange={(e) =>
                                        update(
                                            'amountMax',
                                            e.currentTarget.value
                                                ? Number(e.currentTarget.value)
                                                : undefined,
                                        )
                                    }
                                    placeholder="(blank if single price)"
                                />
                            </Stack>
                        </Box>
                        <Box style={{minWidth: 140}}>
                            <Stack space={2}>
                                <Text size={1} weight="semibold" muted>
                                    Currency · 币种
                                </Text>
                                <Select
                                    value={value?.currency ?? 'USD'}
                                    onChange={(e) =>
                                        update(
                                            'currency',
                                            e.currentTarget.value as NonNullable<PriceValue>['currency'],
                                        )
                                    }
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="ZMW">ZMW (K)</option>
                                </Select>
                            </Stack>
                        </Box>
                    </Flex>
                )}

                {/* Negotiable */}
                {!isRequest && (
                    <Flex gap={2} align="center">
                        <Switch
                            checked={!!value?.negotiable}
                            onChange={(e) => update('negotiable', e.currentTarget.checked)}
                        />
                        <Text size={1}>Negotiable · 可议价</Text>
                    </Flex>
                )}

                {/* Canonical preview */}
                <Card padding={3} radius={2} tone="primary">
                    <Inline space={3}>
                        <Badge tone="primary" mode="default">
                            Preview
                        </Badge>
                        <Text size={2} weight="semibold">
                            {value?.formatted || buildFormatted(value || {}) || '(empty)'}
                        </Text>
                    </Inline>
                </Card>

                {/* Qualifier note · 备注（可选）— bilingual inline */}
                <Stack space={2}>
                    <Text size={1} weight="semibold" muted>
                        Qualifier note · 备注（可选）
                    </Text>
                    <Flex gap={2} wrap="wrap">
                        <Box flex={1} style={{minWidth: 200}}>
                            <Stack space={1}>
                                <Text size={0} muted>
                                    中文 · ZH
                                </Text>
                                <TextInput
                                    value={value?.note?.zh ?? ''}
                                    onChange={(e) => updateNote('zh', e.currentTarget.value)}
                                    placeholder='例如 "租期 ≥ 10 个月"'
                                />
                            </Stack>
                        </Box>
                        <Box flex={1} style={{minWidth: 200}}>
                            <Stack space={1}>
                                <Text size={0} muted>
                                    English · EN
                                </Text>
                                <TextInput
                                    value={value?.note?.en ?? ''}
                                    onChange={(e) => updateNote('en', e.currentTarget.value)}
                                    placeholder='e.g. "Tenure ≥ 10 months"'
                                />
                            </Stack>
                        </Box>
                    </Flex>
                </Stack>
            </Stack>
        </Card>
    )
}
