/* Content-type descriptors: one entry per manageable content family.
 * Everything the generic CRUD engine needs — file, fields, list columns,
 * validation, bilingual labels — lives here, so adding a content type
 * is (mostly) adding a descriptor.
 *
 * Field types: slug, text, combo, textarea, number, bool, date, select,
 *              image, images, paragraphs, pairlist, matrix, sections. */

const BRAND_LINT = [
    { re: /少而美/, msg: '品牌红线:不要使用「少而美」 Brand rule: avoid “少而美”' },
    { re: /起家/, msg: '品牌红线:不要用「起家」,改说「核心业务之一」 Brand rule: say “one of our core businesses”' },
    { re: /物业开发/, msg: '品牌红线:「物业开发」应写成「代建」 Brand rule: use 代建 / Turnkey Development' },
    { re: /刚起步|刚启动/, msg: '品牌红线:不要示弱说「刚起步/刚启动」 Brand rule: no self-deprecating launch language' },
    { re: /\d{3,}\s*\+\s*(套|处|房源|物业|properties)/i, msg: '品牌红线:公司 2024 年成立,不要编造库存数字 Brand rule: no fabricated inventory stats' }
];

const T = {
    properties: {
        key: 'properties', file: 'properties.json', listKey: 'items',
        labelZh: '房源', labelEn: 'Properties', icon: 'home', kind: 'collection',
        imageFolder: 'properties',
        hintZh: '价格可以写成 K 1,500,000 或 US$ 5,000。示例房源请及时替换。',
        hintEn: 'Write prices as K 1,500,000 or US$ 5,000. Replace sample listings when real ones are ready.',
        listColumns: [
            { field: 'img', kind: 'image' },
            { field: 'titleZh', zh: '标题', en: 'Title' },
            { field: 'price', zh: '价格', en: 'Price' },
            { field: 'type', zh: '类型', en: 'Type' },
            { field: 'region', zh: '区域', en: 'Region' },
            { field: 'placeholder', kind: 'flag', zh: '占位', en: 'Sample' }
        ],
        fields: [
            { name: 'id', type: 'slug', zh: '唯一标识', en: 'ID (slug)', required: true, hint: '小写字母数字与连字符,如 kalundu-luxury-house' },
            { name: 'placeholder', type: 'bool', zh: '占位示例', en: 'Placeholder sample' },
            { name: 'type', type: 'select', zh: '房源类型', en: 'Listing type', required: true, half: true, options: [['new', '新房 New'], ['resale', '二手 Resale'], ['rent', '租赁 Rent'], ['land', '土地 Land']] },
            { name: 'transactionType', type: 'select', zh: '交易方式', en: 'Transaction', required: true, half: true, options: [['sale', '出售 Sale'], ['rent', '出租 Rent']] },
            { name: 'region', type: 'combo', zh: '区域', en: 'Region', required: true, half: true, options: ['kalundu', 'ibex-hill', 'kabulonga', 'kingsland', 'lusaka-west', 'olympia', 'roma', 'chongwe'] },
            { name: 'loc', type: 'text', zh: '位置(显示用)', en: 'Location (display)', half: true },
            { name: 'titleZh', type: 'text', zh: '标题(中文)', en: 'Title (zh)', required: true, half: true },
            { name: 'titleEn', type: 'text', zh: '标题(英文)', en: 'Title (en)', required: true, half: true },
            { name: 'descZh', type: 'textarea', zh: '描述(中文)', en: 'Description (zh)', half: true },
            { name: 'descEn', type: 'textarea', zh: '描述(英文)', en: 'Description (en)', half: true },
            { name: 'price', type: 'text', zh: '价格', en: 'Price', half: true, hint: 'K 1,500,000 · Negotiable / US$ 5,000 / month / Price on request' },
            { name: 'area', type: 'text', zh: '面积', en: 'Area', half: true },
            { name: 'beds', type: 'number', zh: '卧室数', en: 'Beds', half: true },
            { name: 'baths', type: 'number', zh: '卫浴数', en: 'Baths', half: true },
            { name: 'img', type: 'image', zh: '封面图', en: 'Cover image', required: true },
            { name: 'gallery', type: 'images', zh: '房源图集', en: 'Property gallery' }
        ]
    },

    news: {
        key: 'news', file: 'news.json', listKey: 'articles',
        labelZh: '新闻', labelEn: 'News', icon: 'newspaper', kind: 'collection',
        imageFolder: 'news',
        hintZh: '首页会展示日期最新的 3 篇新闻。保存前请核对内容和来源。',
        hintEn: 'The homepage shows the 3 newest stories by date. Check the content and source before saving.',
        listColumns: [
            { field: 'coverImg', kind: 'image' },
            { field: 'titleZh', zh: '标题', en: 'Title' },
            { field: 'category', zh: '分类', en: 'Category' },
            { field: 'publishedAt', zh: '发布日期', en: 'Published' },
            { field: 'placeholder', kind: 'flag', zh: '占位', en: 'Sample' }
        ],
        fields: [
            { name: 'id', type: 'slug', zh: '唯一标识', en: 'ID (slug)', required: true },
            { name: 'placeholder', type: 'bool', zh: '占位示例', en: 'Placeholder sample' },
            { name: 'category', type: 'select', zh: '分类', en: 'Category', required: true, half: true, options: [['international', '国际要闻 International'], ['lusaka', '卢萨卡要闻 Lusaka'], ['lusaka-real-estate', '卢萨卡地产速递 Lusaka real estate']] },
            { name: 'publishedAt', type: 'date', zh: '发布日期', en: 'Published at', required: true, half: true },
            { name: 'titleZh', type: 'text', zh: '标题(中文)', en: 'Title (zh)', required: true, half: true },
            { name: 'titleEn', type: 'text', zh: '标题(英文)', en: 'Title (en)', required: true, half: true },
            { name: 'excerptZh', type: 'textarea', zh: '摘要(中文)', en: 'Excerpt (zh)', required: true, half: true },
            { name: 'excerptEn', type: 'textarea', zh: '摘要(英文)', en: 'Excerpt (en)', required: true, half: true },
            { name: 'bodyZh', type: 'paragraphs', zh: '正文段落(中文)', en: 'Body paragraphs (zh)', required: true, half: true },
            { name: 'bodyEn', type: 'paragraphs', zh: '正文段落(英文)', en: 'Body paragraphs (en)', required: true, half: true },
            { name: 'source', type: 'text', zh: '来源', en: 'Source', half: true },
            { name: 'sourceUrl', type: 'text', zh: '来源链接', en: 'Source URL', half: true },
            { name: 'coverImg', type: 'image', zh: '封面图', en: 'Cover image', required: true }
        ]
    },

    projects: {
        key: 'projects', file: 'projects.json', listKey: 'projects',
        labelZh: '集团项目', labelEn: 'Group projects', icon: 'building-2', kind: 'collection',
        imageFolder: 'projects',
        hintZh: '这里管理皇冠、奇迹、静居和荣耀项目。资料补齐后，记得关闭「占位示例」。',
        hintEn: 'Manage the Crown, Miracle, Tranquil and Glory projects here. Turn off “placeholder” once the details are complete.',
        listColumns: [
            { field: 'heroImg', kind: 'image' },
            { field: 'nameZh', zh: '名称', en: 'Name' },
            { field: 'status', zh: '状态', en: 'Status' },
            { field: 'priceRange', zh: '价格区间', en: 'Price range' },
            { field: 'placeholder', kind: 'flag', zh: '占位', en: 'Sample' }
        ],
        fields: [
            { name: 'id', type: 'slug', zh: '唯一标识', en: 'ID (slug)', required: true },
            { name: 'placeholder', type: 'bool', zh: '占位示例', en: 'Placeholder sample' },
            { name: 'nameZh', type: 'text', zh: '名称(中文)', en: 'Name (zh)', required: true, half: true },
            { name: 'nameEn', type: 'text', zh: '名称(英文)', en: 'Name (en)', required: true, half: true },
            { name: 'taglineZh', type: 'text', zh: '一句话标语(中文)', en: 'Tagline (zh)', half: true },
            { name: 'taglineEn', type: 'text', zh: '一句话标语(英文)', en: 'Tagline (en)', half: true },
            { name: 'status', type: 'select', zh: '状态', en: 'Status', required: true, half: true, options: [['selling', '热销中 Selling'], ['under-construction', '建设中 Under construction'], ['sold-out', '已售罄 Sold out'], ['delivered', '已交付 Delivered'], ['upcoming', '即将开盘 Upcoming']] },
            { name: 'location', type: 'text', zh: '位置', en: 'Location', half: true },
            { name: 'launchYear', type: 'number', zh: '启动年份', en: 'Launch year', half: true },
            { name: 'totalUnits', type: 'number', zh: '总套数', en: 'Total units', half: true },
            { name: 'priceRange', type: 'text', zh: '价格区间', en: 'Price range', half: true, hint: 'US$ 280,000+' },
            { name: 'propertyTypeZh', type: 'text', zh: '产品形态(中文)', en: 'Product type (zh)', half: true },
            { name: 'propertyTypeEn', type: 'text', zh: '产品形态(英文)', en: 'Product type (en)', half: true },
            { name: 'developmentAreaZh', type: 'text', zh: '开发体量(中文)', en: 'Development area (zh)', half: true },
            { name: 'developmentAreaEn', type: 'text', zh: '开发体量(英文)', en: 'Development area (en)', half: true },
            { name: 'expectedDeliveryZh', type: 'text', zh: '预计交付(中文)', en: 'Expected delivery (zh)', half: true },
            { name: 'expectedDeliveryEn', type: 'text', zh: '预计交付(英文)', en: 'Expected delivery (en)', half: true },
            { name: 'descriptionZh', type: 'textarea', zh: '项目介绍(中文)', en: 'Description (zh)', half: true },
            { name: 'descriptionEn', type: 'textarea', zh: '项目介绍(英文)', en: 'Description (en)', half: true },
            { name: 'keyFeatures', type: 'pairlist', zh: '核心卖点(中英对照)', en: 'Key features (zh/en pairs)' },
            { name: 'heroImg', type: 'image', zh: '主图', en: 'Hero image', required: true },
            { name: 'gallery', type: 'images', zh: '图集', en: 'Gallery' }
        ]
    },

    team: {
        key: 'team', file: 'team.json', listKey: 'members',
        labelZh: '团队成员', labelEn: 'Team', icon: 'users', kind: 'collection',
        imageFolder: 'team',
        listColumns: [
            { field: 'photo', kind: 'image' },
            { field: 'name', zh: '姓名', en: 'Name' },
            { field: 'roleZh', zh: '职务', en: 'Role' }
        ],
        fields: [
            { name: 'id', type: 'slug', zh: '唯一标识', en: 'ID (slug)', required: true },
            { name: 'name', type: 'text', zh: '姓名(英文)', en: 'Name (en)', required: true, half: true },
            { name: 'nameZh', type: 'text', zh: '姓名(中文)', en: 'Name (zh)', half: true },
            { name: 'role', type: 'text', zh: '职务(英文)', en: 'Role (en)', required: true, half: true },
            { name: 'roleZh', type: 'text', zh: '职务(中文)', en: 'Role (zh)', required: true, half: true },
            { name: 'initials', type: 'text', zh: '姓名缩写(2 字母)', en: 'Initials (2 letters)', half: true },
            { name: 'photo', type: 'image', zh: '头像', en: 'Photo' }
        ]
    },

    'led-products': {
        key: 'led-products', file: 'led-products.json', listKey: 'products',
        labelZh: 'LED 产品', labelEn: 'LED products', icon: 'tv-minimal-play', kind: 'collection',
        imageFolder: 'led',
        hintZh: '产品参数请以 Absen 官方资料为准。价格留空时，网站会显示「面议」。',
        hintEn: 'Use official Absen specifications. If the price is empty, the website shows “On request”.',
        listColumns: [
            { field: 'img', kind: 'image' },
            { field: 'model', zh: '型号', en: 'Model' },
            { field: 'series', zh: '系列', en: 'Series' },
            { field: 'usage', zh: '用途', en: 'Usage' }
        ],
        fields: [
            { name: 'id', type: 'slug', zh: '唯一标识', en: 'ID (slug)', required: true },
            { name: 'placeholder', type: 'bool', zh: '占位示例', en: 'Placeholder sample' },
            { name: 'series', type: 'combo', zh: '系列', en: 'Series', required: true, half: true, options: ['A25', 'NT V2'] },
            { name: 'model', type: 'text', zh: '型号', en: 'Model', required: true, half: true },
            { name: 'usage', type: 'select', zh: '用途', en: 'Usage', required: true, half: true, options: [['outdoor', '户外固装 Outdoor fixed'], ['rental', '租赁 Rental']] },
            { name: 'mode', type: 'select', zh: '交易模式', en: 'Mode', required: true, half: true, options: [['sale', '销售 Sale'], ['rental', '租赁 Rental']] },
            { name: 'nameZh', type: 'text', zh: '名称(中文)', en: 'Name (zh)', required: true, half: true },
            { name: 'nameEn', type: 'text', zh: '名称(英文)', en: 'Name (en)', required: true, half: true },
            { name: 'pixelPitch', type: 'text', zh: '点间距', en: 'Pixel pitch', half: true },
            { name: 'brightness', type: 'text', zh: '亮度', en: 'Brightness', half: true },
            { name: 'cabinetSize', type: 'text', zh: '箱体尺寸', en: 'Cabinet size', half: true },
            { name: 'ip', type: 'text', zh: '防护等级', en: 'IP rating', half: true },
            { name: 'refresh', type: 'text', zh: '刷新率', en: 'Refresh rate', half: true },
            { name: 'cert', type: 'text', zh: '认证', en: 'Certifications', half: true },
            { name: 'install', type: 'text', zh: '安装方式', en: 'Installation', half: true },
            { name: 'salePrice', type: 'text', zh: '销售价(留空=面议)', en: 'Sale price (empty = on request)', half: true },
            { name: 'rentalPrice', type: 'text', zh: '租赁价(留空=面议)', en: 'Rental price (empty = on request)', half: true },
            { name: 'noteZh', type: 'textarea', zh: '备注(中文)', en: 'Note (zh)', half: true },
            { name: 'noteEn', type: 'textarea', zh: '备注(英文)', en: 'Note (en)', half: true },
            { name: 'img', type: 'image', zh: '产品图', en: 'Product image', required: true }
        ]
    },

    'led-billboards': {
        key: 'led-billboards', file: 'led-billboards.json', listKey: 'billboards',
        labelZh: 'LED 户外点位', labelEn: 'LED billboards', icon: 'megaphone', kind: 'collection',
        imageFolder: 'led',
        hintZh: '这里只放已经确认的真实点位、照片、地址和报价。没有点位时，网站会自动隐藏这个板块。',
        hintEn: 'Add confirmed locations, photos, addresses and rates only. The website hides this section when there are no locations.',
        listColumns: [
            { field: 'img', kind: 'image' },
            { field: 'code', zh: '编号', en: 'Code' },
            { field: 'nameZh', zh: '点位名称', en: 'Name' },
            { field: 'availability', zh: '状态', en: 'Availability' }
        ],
        fields: [
            { name: 'id', type: 'slug', zh: '唯一标识', en: 'ID (slug)', required: true },
            { name: 'code', type: 'text', zh: '点位编号', en: 'Site code', required: true, half: true, hint: 'LSK-01' },
            { name: 'placeholder', type: 'bool', zh: '占位示例(不应勾选)', en: 'Placeholder (should stay off)' },
            { name: 'nameZh', type: 'text', zh: '点位名称(中文)', en: 'Name (zh)', required: true, half: true },
            { name: 'nameEn', type: 'text', zh: '点位名称(英文)', en: 'Name (en)', required: true, half: true },
            { name: 'addressZh', type: 'text', zh: '地址(中文)', en: 'Address (zh)', half: true },
            { name: 'addressEn', type: 'text', zh: '地址(英文)', en: 'Address (en)', half: true },
            { name: 'screenSize', type: 'text', zh: '屏幕尺寸', en: 'Screen size', half: true, hint: '12m × 6m' },
            { name: 'dailyTraffic', type: 'text', zh: '日均人流/车流', en: 'Daily traffic', half: true },
            { name: 'availability', type: 'select', zh: '状态', en: 'Availability', required: true, half: true, options: [['booking', '招商中 Booking'], ['coming', '即将上线 Coming'], ['booked', '已订满 Booked']] },
            { name: 'monthlyRate', type: 'text', zh: '月租报价(留空=面议)', en: 'Monthly rate (empty = on request)', half: true },
            { name: 'mapUrl', type: 'text', zh: '地图链接', en: 'Map URL', half: true },
            { name: 'img', type: 'image', zh: '点位照片', en: 'Site photo', required: true }
        ]
    },

    services: {
        key: 'services', file: 'services.json', listKey: 'pillars',
        labelZh: '业务板块文案', labelEn: 'Service pillars', icon: 'compass', kind: 'fixed',
        imageFolder: 'stock',
        hintZh: '房地产写「核心业务之一」，「物业开发」统一写成「代建」。LED 文案保持积极，但不要编数据。',
        hintEn: 'Call real estate “one of our core businesses” and use “Turnkey Development” for 代建. Keep LED copy positive without inventing figures.',
        listColumns: [
            { field: 'titleZh', zh: '板块', en: 'Pillar' },
            { field: 'summaryZh', zh: '摘要', en: 'Summary' }
        ],
        fields: [
            { name: 'titleZh', type: 'text', zh: '板块名(中文)', en: 'Title (zh)', required: true, half: true },
            { name: 'title', type: 'text', zh: '板块名(英文)', en: 'Title (en)', required: true, half: true },
            { name: 'summaryZh', type: 'textarea', zh: '一句话摘要(中文)', en: 'Summary (zh)', required: true, half: true },
            { name: 'summary', type: 'textarea', zh: '一句话摘要(英文)', en: 'Summary (en)', required: true, half: true },
            { name: 'narrativeZh', type: 'paragraphs', zh: '叙述段落(中文)', en: 'Narrative (zh)', required: true, half: true },
            { name: 'narrative', type: 'paragraphs', zh: '叙述段落(英文)', en: 'Narrative (en)', required: true, half: true },
            {
                name: 'deliverableRows', type: 'matrix', zh: '服务项(名称与说明,中英对照)', en: 'Deliverables (name + description, zh/en)',
                columns: [
                    { key: 'zh', zh: '名称(中)', en: 'Name (zh)' },
                    { key: 'en', zh: '名称(英)', en: 'Name (en)' },
                    { key: 'descZh', zh: '说明(中)', en: 'Desc (zh)', wide: true },
                    { key: 'descEn', zh: '说明(英)', en: 'Desc (en)', wide: true }
                ]
            },
            { name: 'heroImg', type: 'image', zh: '板块头图', en: 'Hero image' }
        ],
        prepareForm: function (item) {
            const out = Object.assign({}, item);
            out.deliverableRows = (item.deliverables || []).map(function (en, i) {
                return {
                    en: en,
                    zh: (item.deliverablesZh || [])[i] || '',
                    descEn: (item.deliverableDescEn || [])[i] || '',
                    descZh: (item.deliverableDescZh || [])[i] || ''
                };
            });
            return out;
        },
        applySave: function (existing, data) {
            const rows = data.deliverableRows || [];
            const out = Object.assign({}, existing, data);
            delete out.deliverableRows;
            out.deliverables = rows.map(function (r) { return r.en || ''; });
            out.deliverablesZh = rows.map(function (r) { return r.zh || ''; });
            out.deliverableDescEn = rows.map(function (r) { return r.descEn || ''; });
            out.deliverableDescZh = rows.map(function (r) { return r.descZh || ''; });
            return out;
        }
    },

    legal: {
        key: 'legal', file: 'legal.json', listKey: null,
        labelZh: '法律文本', labelEn: 'Legal pages', icon: 'scale', kind: 'fixed',
        imageFolder: 'misc',
        hintZh: '这里是隐私、Cookie 和服务条款。修改重要内容前，建议先让赞比亚律师确认。',
        hintEn: 'Privacy, Cookie and service terms live here. Ask Zambian counsel to review important changes.',
        listColumns: [
            { field: '_label', zh: '文档', en: 'Document' },
            { field: 'title', zh: '标题', en: 'Title' },
            { field: 'lastUpdated', zh: '更新日期', en: 'Updated' }
        ],
        fields: [
            { name: 'title', type: 'text', zh: '标题', en: 'Title', required: true },
            { name: 'lastUpdated', type: 'text', zh: '更新日期', en: 'Last updated', required: true, half: true },
            { name: 'intro', type: 'textarea', zh: '引言', en: 'Intro' },
            { name: 'sections', type: 'sections', zh: '章节(标题 + 段落)', en: 'Sections (heading + paragraphs)', required: true }
        ],
        /* virtual collection over json[lang][doc] */
        legalIds: ['zh-privacy', 'zh-cookies', 'zh-terms', 'en-privacy', 'en-cookies', 'en-terms'],
        legalLabel: function (id) {
            const map = { privacy: '隐私政策 Privacy', cookies: 'Cookie 政策 Cookies', terms: '使用条款 Terms' };
            const lang = id.slice(0, 2) === 'zh' ? '中文' : 'EN';
            return lang + ' · ' + map[id.split('-').slice(1).join('-')];
        },
        list: function (json) {
            return this.legalIds.map(function (id) {
                const [lang, ...rest] = id.split('-');
                const doc = json[lang][rest.join('-')];
                return { id, _label: this.legalLabel(id), title: doc.title, lastUpdated: doc.lastUpdated };
            }, this);
        },
        getItem: function (json, id) {
            const [lang, ...rest] = id.split('-');
            const doc = (json[lang] || {})[rest.join('-')];
            return doc ? Object.assign({ id }, doc) : null;
        },
        putItem: function (json, id, data) {
            const [lang, ...rest] = id.split('-');
            const key = rest.join('-');
            const existing = json[lang][key];
            json[lang][key] = Object.assign({}, existing, {
                title: data.title, lastUpdated: data.lastUpdated,
                intro: data.intro, sections: data.sections
            });
            return json;
        }
    }
};

/* ── generic helpers used by routes ── */

function descriptor(key) { return T[key] || null; }
function allDescriptors() { return Object.keys(T).map(function (k) { return T[k]; }); }

function listItems(desc, json) {
    if (desc.list) return desc.list(json);
    return json[desc.listKey] || [];
}
function getItem(desc, json, id) {
    if (desc.getItem) return desc.getItem(json, id);
    return (json[desc.listKey] || []).find(function (x) { return x.id === id; }) || null;
}

/* ── validation ── */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;
const IMG_RE = /^\/assets\/img\/[A-Za-z0-9._/-]+$/;

function validateItem(desc, data, opts) {
    const errors = [], warnings = [];
    const clean = {};
    for (const f of desc.fields) {
        let v = data[f.name];
        switch (f.type) {
            case 'slug':
                v = String(v || '').trim().toLowerCase();
                if (!v && f.required) errors.push(`${f.zh} ${f.en}: 必填 required`);
                else if (v && !SLUG_RE.test(v)) errors.push(`${f.zh} ${f.en}: 只能用小写字母、数字、连字符 lowercase letters, digits, hyphens only`);
                break;
            case 'text': case 'combo':
                v = String(v == null ? '' : v).trim();
                if (f.required && !v) errors.push(`${f.zh} ${f.en}: 必填 required`);
                break;
            case 'textarea':
                v = String(v == null ? '' : v).trim();
                if (f.required && !v) errors.push(`${f.zh} ${f.en}: 必填 required`);
                break;
            case 'number':
                if (v === '' || v == null) { v = null; }
                else { v = Number(v); if (!isFinite(v)) errors.push(`${f.zh} ${f.en}: 必须是数字 must be a number`); }
                break;
            case 'bool':
                v = v === true || v === 'true' || v === 'on';
                break;
            case 'date':
                v = String(v || '').trim();
                if (f.required && !v) errors.push(`${f.zh} ${f.en}: 必填 required`);
                else if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push(`${f.zh} ${f.en}: 格式 YYYY-MM-DD`);
                break;
            case 'select':
                v = String(v || '');
                if (!f.options.some(function (o) { return o[0] === v; })) {
                    if (f.required) errors.push(`${f.zh} ${f.en}: 无效选项 invalid option`);
                }
                break;
            case 'image':
                v = String(v || '').trim();
                if (f.required && !v) errors.push(`${f.zh} ${f.en}: 必须选择图片 image required`);
                else if (v && !IMG_RE.test(v)) errors.push(`${f.zh} ${f.en}: 非法图片路径 invalid image path`);
                break;
            case 'images':
                v = Array.isArray(v) ? v.map(String) : [];
                if (v.some(function (p) { return !IMG_RE.test(p); })) errors.push(`${f.zh} ${f.en}: 含非法图片路径 invalid image path`);
                break;
            case 'paragraphs':
                v = (Array.isArray(v) ? v : []).map(function (s) { return String(s).trim(); }).filter(Boolean);
                if (f.required && !v.length) errors.push(`${f.zh} ${f.en}: 至少一段 at least one paragraph`);
                break;
            case 'pairlist':
                v = (Array.isArray(v) ? v : []).map(function (r) {
                    return { zh: String(r.zh || '').trim(), en: String(r.en || '').trim() };
                }).filter(function (r) { return r.zh || r.en; });
                v.forEach(function (r, i) {
                    if (!r.zh || !r.en) warnings.push(`${f.zh} 第 ${i + 1} 行只填了一种语言 row ${i + 1} has only one language`);
                });
                break;
            case 'matrix':
                v = (Array.isArray(v) ? v : []).map(function (r) {
                    const row = {};
                    f.columns.forEach(function (c) { row[c.key] = String(r[c.key] || '').trim(); });
                    return row;
                }).filter(function (r) { return Object.values(r).some(Boolean); });
                break;
            case 'sections':
                v = (Array.isArray(v) ? v : []).map(function (s) {
                    return {
                        heading: String(s.heading || '').trim(),
                        body: (Array.isArray(s.body) ? s.body : []).map(function (p) { return String(p).trim(); }).filter(Boolean)
                    };
                }).filter(function (s) { return s.heading || s.body.length; });
                if (f.required && !v.length) errors.push(`${f.zh} ${f.en}: 至少一个章节 at least one section`);
                break;
            default:
                break;
        }
        clean[f.name] = v;

        /* brand-voice lint: warn (never block) on Chinese-facing text */
        if (typeof v === 'string' && /Zh$|^title$|^intro$/.test(f.name) === false && /[一-鿿]/.test(v)) {
            // also lint zh content living in non-Zh-suffixed fields
        }
        const lintTargets = [];
        if (typeof v === 'string') lintTargets.push(v);
        if (Array.isArray(v)) v.forEach(function (x) {
            if (typeof x === 'string') lintTargets.push(x);
            else if (x && typeof x === 'object') Object.values(x).forEach(function (y) { if (typeof y === 'string') lintTargets.push(y); });
        });
        for (const text of lintTargets) {
            for (const rule of BRAND_LINT) {
                if (rule.re.test(text)) {
                    const w = `「${f.zh}」: ${rule.msg}`;
                    if (!warnings.includes(w)) warnings.push(w);
                }
            }
        }
    }
    /* price format soft check */
    if (typeof clean.price === 'string' && clean.price &&
        !/^(K |US\$ |Price on request|面议)/.test(clean.price)) {
        warnings.push('价格建议以 K 或 US$ 开头,或写 Price on request — price should start with K / US$ or be "Price on request"');
    }
    return { errors, warnings, clean };
}

module.exports = { descriptor, allDescriptors, listItems, getItem, validateItem, BRAND_LINT };
