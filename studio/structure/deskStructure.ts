import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureBuilder, StructureResolverContext} from 'sanity/structure'
import {
    HomeIcon,
    UsersIcon,
    PackageIcon,
    InfoOutlineIcon,
    CogIcon,
    DocumentTextIcon,
    StackIcon,
    EarthGlobeIcon,
    PinIcon,
    TvIcon,
    BillIcon,
} from '@sanity/icons'

/* Custom desk structure with bilingual Chinese labels so the Marketing
 * Assistant sees a Chinese-friendly navigation around the Sanity chrome
 * (which is still English). */
export function deskStructure(S: StructureBuilder, context: StructureResolverContext) {
    return S.list()
        .title('ROOFY · 内容后台')
        .items([
            // Singletons at the top — most-edited day-to-day
            S.listItem()
                .title('网站内容 · Site content')
                .icon(StackIcon)
                .child(
                    S.document().schemaType('siteContent').documentId('siteContent').title('网站内容'),
                ),
            S.listItem()
                .title('公司设置 · Settings')
                .icon(CogIcon)
                .child(
                    S.document().schemaType('siteSettings').documentId('siteSettings').title('公司设置'),
                ),

            S.divider(),

            // Orderable group projects (flagship developments)
            orderableDocumentListDeskItem({
                type: 'project',
                title: '集团项目 · Group projects',
                icon: PinIcon,
                S,
                context,
            }),

            // Orderable property list
            orderableDocumentListDeskItem({
                type: 'property',
                title: '房源 · Properties',
                icon: HomeIcon,
                S,
                context,
            }),

            // Orderable team list
            orderableDocumentListDeskItem({
                type: 'teamMember',
                title: '团队 · Team',
                icon: UsersIcon,
                S,
                context,
            }),

            // Three pillars — collection but visually appears as 3 fixed items
            S.listItem()
                .title('业务 · Service pillars')
                .icon(PackageIcon)
                .child(S.documentTypeList('pillar').title('业务 · Service pillars')),

            // LED products (sale / rental)
            orderableDocumentListDeskItem({
                type: 'ledProduct',
                title: 'LED 产品 · Sale / Rental',
                icon: TvIcon,
                S,
                context,
            }),

            // LED billboards (outdoor locations)
            orderableDocumentListDeskItem({
                type: 'ledBillboard',
                title: 'LED 户外点位 · Billboards',
                icon: BillIcon,
                S,
                context,
            }),

            // Three legal pages
            S.listItem()
                .title('法律 · Legal pages')
                .icon(DocumentTextIcon)
                .child(S.documentTypeList('legalPage').title('法律 · Legal pages')),

            // News, broken down by category for fast filtering
            S.listItem()
                .title('新闻 · News')
                .icon(EarthGlobeIcon)
                .child(
                    S.list()
                        .title('新闻 · News')
                        .items([
                            S.listItem()
                                .title('国际要闻 · International')
                                .icon(EarthGlobeIcon)
                                .child(
                                    S.documentList()
                                        .title('国际要闻')
                                        .filter('_type == "newsArticle" && category == "international"')
                                        .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
                                ),
                            S.listItem()
                                .title('卢萨卡要闻 · Lusaka')
                                .icon(EarthGlobeIcon)
                                .child(
                                    S.documentList()
                                        .title('卢萨卡要闻')
                                        .filter('_type == "newsArticle" && category == "lusaka"')
                                        .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
                                ),
                            S.listItem()
                                .title('卢萨卡地产要闻速递 · Lusaka real estate')
                                .icon(EarthGlobeIcon)
                                .child(
                                    S.documentList()
                                        .title('卢萨卡地产要闻速递')
                                        .filter('_type == "newsArticle" && category == "lusaka-real-estate"')
                                        .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
                                ),
                            S.divider(),
                            S.listItem()
                                .title('全部新闻 · All articles')
                                .child(
                                    S.documentList()
                                        .title('全部新闻')
                                        .filter('_type == "newsArticle"')
                                        .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
                                ),
                        ]),
                ),

            S.divider(),

            // Help / reference
            S.listItem()
                .title('品牌守则 · Brand voice')
                .icon(InfoOutlineIcon)
                .child(
                    S.component()
                        .title('品牌守则 · Brand voice')
                        .id('brandVoiceHelp')
                        .component(() => null),
                ),
        ])
}
