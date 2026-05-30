import {defineType} from 'sanity'
import {PriceInput} from '../../components/PriceInput'

/* Structured price input. Eliminates the free-text inconsistency of
 * "K30,000/month" / "$5000" / "K1,500,000" / "Price on request" / etc.
 * The custom input rebuilds the canonical `formatted` string on save so
 * the frontend renders directly from `formatted` (single source of truth). */
export default defineType({
    name: 'price',
    title: 'Price',
    type: 'object',
    components: {
        input: PriceInput,
    },
    fields: [
        {
            name: 'period',
            title: 'Period',
            type: 'string',
            options: {
                list: [
                    {title: 'Per month / 月租', value: 'month'},
                    {title: 'Total / 总价', value: 'total'},
                    {title: 'Per night / 每晚', value: 'per-night'},
                    {title: 'Price on request / 价格面议', value: 'request'},
                ],
            },
            initialValue: 'total',
        },
        {
            name: 'amount',
            title: 'Amount',
            type: 'number',
        },
        {
            name: 'amountMax',
            title: 'Range upper bound (optional, for "K1,000 – K2,000")',
            type: 'number',
        },
        {
            name: 'currency',
            title: 'Currency',
            type: 'string',
            options: {
                list: [
                    {title: 'ZMW (K)', value: 'ZMW'},
                    {title: 'USD ($)', value: 'USD'},
                ],
            },
            initialValue: 'USD',
        },
        {
            name: 'negotiable',
            title: 'Negotiable',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'formatted',
            title: 'Formatted (auto-generated, read-only)',
            type: 'string',
            readOnly: true,
            description: 'The canonical string rendered to the public site. Do not edit by hand.',
        },
        {
            name: 'note',
            title: 'Qualifier note (e.g. "Tenure ≥ 10 months")',
            type: 'bilingualString',
        },
    ],
    preview: {
        select: {formatted: 'formatted'},
        prepare({formatted}: {formatted?: string}) {
            return {title: formatted || '(no price)'}
        },
    },
    validation: (Rule) =>
        Rule.custom((val: {amount?: number; period?: string} | undefined) => {
            if (!val) return true
            if (val.period === 'request') return true
            if (val.amount == null) return 'Amount is required unless period is "Price on request"'
            return true
        }),
})
