/* Server-side HTML rendering: tiny string-template helpers, no view engine.
 * Visual language mirrors the public site: slate + amber. */

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function attrJson(obj) { return esc(JSON.stringify(obj == null ? '' : obj)); }

/* Bilingual label: zh prominent, en muted underneath. */
function L(zh, en) {
    return `<span class="lz">${esc(zh)}</span><span class="le">${esc(en)}</span>`;
}

function layout(opts) {
    const BASE = opts.base || '/admin';
    const navItems = [
        ['', '概览', 'Dashboard', 'layout-dashboard'],
        ['c/news', '新闻', 'News', 'newspaper'],
        ['c/properties', '房源', 'Properties', 'home'],
        ['c/projects', '集团项目', 'Projects', 'building-2'],
        ['c/team', '团队成员', 'Team', 'users'],
        ['c/led-products', 'LED 产品', 'LED products', 'tv-minimal-play'],
        ['c/led-billboards', 'LED 点位', 'LED billboards', 'megaphone'],
        ['c/services', '业务文案', 'Pillars', 'compass'],
        ['c/legal', '法律文本', 'Legal', 'scale'],
        ['media', '图片库', 'Media', 'image'],
        ['history', '发布历史', 'History', 'history'],
        ['settings', '站点设置', 'Settings', 'settings'],
        ['account', '账号', 'Account', 'key-round']
    ];
    const nav = navItems.map(function (n) {
        const href = BASE + '/' + n[0];
        const active = opts.active === (n[0] || 'dashboard') || (n[0] === '' && opts.active === 'dashboard');
        return `<a class="nav-item${active ? ' active' : ''}" href="${href}">` +
            `<i data-lucide="${n[3]}" class="ni"></i><span class="nt">${L(n[1], n[2])}</span></a>`;
    }).join('');
    return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>${esc(opts.title)} · ROOFY Admin</title>
<link rel="stylesheet" href="${BASE}/public/admin.css">
</head>
<body>
<div class="shell">
    <aside class="side">
        <div class="brand"><span class="b1">Roofy</span><span class="b2">内容管理 Admin</span></div>
        <nav>${nav}</nav>
        <div class="side-foot">
            <div class="who">👤 ${esc(opts.user ? opts.user.name : '')}</div>
            <form method="post" action="${BASE}/logout"><button class="btn-ghost" type="submit">${L('退出登录', 'Sign out')}</button></form>
        </div>
    </aside>
    <main class="main">
        <header class="topbar">
            <h1>${esc(opts.title)}${opts.titleEn ? `<span class="t-en">${esc(opts.titleEn)}</span>` : ''}</h1>
            <div class="top-actions">${opts.actions || ''}</div>
        </header>
        ${opts.notice ? `<div class="notice">${opts.notice}</div>` : ''}
        <section class="content">${opts.body}</section>
    </main>
</div>
<div id="toast"></div>
<script>window.ADMIN_BASE=${JSON.stringify(BASE)};</script>
<script src="${BASE}/site-assets/assets/vendor/lucide.min.js"></script>
<script src="${BASE}/public/admin.js"></script>
</body>
</html>`;
}

/* ── form field renderers ── */

function fieldShell(f, inner, extraCls) {
    return `<div class="field ${f.half ? 'half' : 'full'} ${extraCls || ''}">` +
        `<label class="flabel">${L(f.zh, f.en)}${f.required ? '<span class="req">*</span>' : ''}</label>` +
        inner +
        (f.hint ? `<div class="fhint">${esc(f.hint)}</div>` : '') +
        `</div>`;
}

function renderField(f, value, ctx) {
    const name = esc(f.name);
    const v = value == null ? '' : value;
    switch (f.type) {
        case 'slug': {
            const ro = ctx.isNew ? '' : ' readonly';
            return fieldShell(f, `<input class="inp mono" name="${name}" data-ftype="slug" value="${esc(v)}"${ro}>` +
                (ctx.isNew ? '' : `<div class="fhint">已创建的条目不可改 ID — ID is fixed after creation</div>`));
        }
        case 'text': case 'date':
            return fieldShell(f, `<input class="inp" type="${f.type === 'date' ? 'date' : 'text'}" name="${name}" data-ftype="${f.type}" value="${esc(v)}">`);
        case 'combo': {
            const listId = 'dl-' + name;
            const opts = (f.options || []).map(function (o) { return `<option value="${esc(o)}">`; }).join('');
            return fieldShell(f, `<input class="inp" name="${name}" data-ftype="text" list="${listId}" value="${esc(v)}"><datalist id="${listId}">${opts}</datalist>`);
        }
        case 'textarea':
            return fieldShell(f, `<textarea class="inp ta" name="${name}" data-ftype="text" rows="4">${esc(v)}</textarea>`);
        case 'number':
            return fieldShell(f, `<input class="inp" type="number" name="${name}" data-ftype="number" value="${v === null ? '' : esc(v)}">`);
        case 'bool':
            return fieldShell(f, `<label class="check"><input type="checkbox" name="${name}" data-ftype="bool"${v ? ' checked' : ''}><span>${L('是 / 启用', 'Yes / on')}</span></label>`);
        case 'select': {
            const opts = f.options.map(function (o) {
                return `<option value="${esc(o[0])}"${String(v) === o[0] ? ' selected' : ''}>${esc(o[1])}</option>`;
            }).join('');
            return fieldShell(f, `<select class="inp" name="${name}" data-ftype="text">${opts}</select>`);
        }
        case 'image':
            return fieldShell(f, `<div class="imgpick" data-name="${name}" data-folder="${esc(ctx.imageFolder)}">` +
                `<input type="hidden" name="${name}" data-ftype="text" value="${esc(v)}">` +
                `<div class="imgprev">${v ? `<img src="${esc(ctx.assetBase + v)}" alt="">` : `<span class="noimg">${L('未选择', 'none')}</span>`}</div>` +
                `<div class="imgbtns">` +
                `<button type="button" class="btn-sm act-upload">${L('上传', 'Upload')}</button>` +
                `<button type="button" class="btn-sm act-library">${L('图库选择', 'Library')}</button>` +
                `<button type="button" class="btn-sm act-clear">${L('清除', 'Clear')}</button>` +
                `</div></div>`);
        case 'images':
            return fieldShell(f, `<div class="imglist" data-name="${name}" data-folder="${esc(ctx.imageFolder)}" data-value="${attrJson(v || [])}"></div>`);
        case 'paragraphs':
            return fieldShell(f, `<div class="paras" data-name="${name}" data-value="${attrJson(v || [])}"></div>`);
        case 'pairlist':
            return fieldShell(f, `<div class="pairlist" data-name="${name}" data-value="${attrJson(v || [])}"></div>`);
        case 'matrix':
            return fieldShell(f, `<div class="matrix" data-name="${name}" data-cols="${attrJson(f.columns)}" data-value="${attrJson(v || [])}"></div>`);
        case 'sections':
            return fieldShell(f, `<div class="sections" data-name="${name}" data-value="${attrJson(v || [])}"></div>`);
        default:
            return '';
    }
}

function renderForm(desc, item, opts) {
    const ctx = { isNew: !!opts.isNew, imageFolder: desc.imageFolder, assetBase: opts.assetBase };
    const fields = desc.fields.map(function (f) {
        return renderField(f, item ? item[f.name] : (f.type === 'bool' ? false : ''), ctx);
    }).join('');
    return `<form id="content-form" class="cform"
        data-type="${esc(desc.key)}" data-id="${esc(item && item.id ? item.id : '')}"
        data-base-sha="${esc(opts.baseSha)}" data-is-new="${ctx.isNew ? '1' : '0'}">
        <div class="fgrid">${fields}</div>
        <div class="formbar">
            <button type="submit" class="btn-primary">${L('保存并发布', 'Save & publish')}</button>
            <a class="btn-ghost" href="${esc(opts.backHref)}">${L('返回列表', 'Back to list')}</a>
            <span class="savemsg" id="savemsg"></span>
        </div>
    </form>`;
}

function renderList(desc, items, opts) {
    const cols = desc.listColumns;
    const head = cols.map(function (c) {
        return `<th>${c.kind === 'image' ? '' : L(c.zh, c.en)}</th>`;
    }).join('') + `<th class="ops-col">${L('操作', 'Actions')}</th>`;

    const rows = items.map(function (it, idx) {
        const tds = cols.map(function (c) {
            const v = it[c.field];
            if (c.kind === 'image') {
                return `<td class="td-img">${v ? `<img src="${esc(opts.assetBase + v)}" loading="lazy" alt="">` : '<span class="noimg">—</span>'}</td>`;
            }
            if (c.kind === 'flag') {
                return `<td>${v ? '<span class="badge warn">占位 sample</span>' : ''}</td>`;
            }
            return `<td>${esc(String(v == null ? '' : v)).slice(0, 80)}</td>`;
        }).join('');
        const canSort = desc.kind === 'collection';
        const canDel = desc.kind === 'collection';
        return `<tr data-id="${esc(it.id)}">${tds}<td class="ops">` +
            `<a class="btn-sm" href="${opts.base}/c/${desc.key}/${encodeURIComponent(it.id)}">${L('编辑', 'Edit')}</a>` +
            (canSort ? `<button class="btn-sm act-up" title="上移 up">↑</button><button class="btn-sm act-down" title="下移 down">↓</button>` : '') +
            (canDel ? `<button class="btn-sm danger act-del">${L('删除', 'Delete')}</button>` : '') +
            `</td></tr>`;
    }).join('');

    const hint = (desc.hintZh || desc.hintEn)
        ? `<div class="hintbox">${L(desc.hintZh || '', desc.hintEn || '')}</div>` : '';
    return `${hint}
    <div class="tablewrap"><table class="ltable" id="list-table"
        data-type="${esc(desc.key)}" data-base-sha="${esc(opts.baseSha)}">
        <thead><tr>${head}</tr></thead><tbody>${rows}</tbody>
    </table></div>
    ${items.length === 0 ? `<div class="empty">${L('暂无条目', 'No items yet')}</div>` : ''}`;
}

module.exports = { esc, L, layout, renderForm, renderList, renderField, attrJson };
