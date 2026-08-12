/* Standalone pages: dashboard, media, history, settings, account. */
const express = require('express');
const D = require('../descriptors');
const store = require('../lib/store');
const gitops = require('../lib/gitops');
const uploads = require('../lib/uploads');
const auth = require('../lib/auth');
const leads = require('../lib/leads');
const { audit, tail, query: queryAudit, formatLocal } = require('../lib/audit');
const H = require('../lib/html');

const router = express.Router();

/* ── dashboard ── */
router.get('/', async function (req, res) {
    const cards = D.allDescriptors().map(function (desc) {
        let count = '—';
        try {
            const { json } = store.readFile(desc.file);
            count = String(D.listItems(desc, json).length);
        } catch (e) { /* keep dash */ }
        return `<a class="card stat" href="${req.baseUrl}/c/${desc.key}">
            <div class="stat-ic"><i data-lucide="${desc.icon}"></i></div>
            <div class="stat-n">${count}</div>
            <div class="stat-l">${H.L(desc.labelZh, desc.labelEn)}</div></a>`;
    }).join('');

    let commits = [];
    try { commits = await gitops.log(['site'], 8); } catch (e) { /* empty */ }
    const head = await gitops.headInfo();
    const commitRows = commits.map(function (c) {
        return `<tr><td class="mono">${H.esc(c.sha)}</td><td>${H.esc(c.subject)}</td><td>${H.esc(c.author)}</td><td>${H.esc(c.date)}</td></tr>`;
    }).join('');

    const audits = tail(6).map(function (a) {
        return `<tr><td>${H.esc(formatLocal(a.at).slice(0, 16))}</td><td>${H.esc(a.user)}</td><td>${H.esc(a.action)}</td><td>${H.esc(a.detail)}</td></tr>`;
    }).join('');

    res.send(H.layout({
        base: req.baseUrl, active: 'dashboard', user: req.adminUser,
        title: '概览', titleEn: 'Dashboard',
        body: `
        <div class="hintbox">${H.L(
            '品牌红线:公司 2024 年成立,不编造数字与评价;LED 业务只展示真实点位与真实产品;「物业开发」一律写「代建」;保存即上线,改错可在「发布历史」回滚。',
            'Brand rules: founded 2024 — no fabricated stats or testimonials; LED shows real sites and products only; always 代建 / Turnkey Development; saves go live immediately and can be rolled back under History.')}</div>
        <div class="cards">${cards}</div>
        <div class="panel"><h2>${H.L('最近发布', 'Recent publishes')} <span class="mono dim">HEAD ${H.esc(head.sha)} · 待推送 unpushed: ${H.esc(head.ahead)}</span></h2>
            <div class="tablewrap"><table class="ltable"><thead><tr><th>commit</th><th>${H.L('内容', 'Subject')}</th><th>${H.L('操作人', 'By')}</th><th>${H.L('时间', 'When')}</th></tr></thead>
            <tbody>${commitRows || '<tr><td colspan="4">—</td></tr>'}</tbody></table></div></div>
        <div class="panel"><h2>${H.L('操作日志', 'Audit log')} <a class="btn-sm" href="${req.baseUrl}/audit">${H.L('查看全部', 'View all')}</a></h2>
            <div class="tablewrap"><table class="ltable"><thead><tr><th>${H.L('时间', 'When')}</th><th>${H.L('用户', 'User')}</th><th>${H.L('动作', 'Action')}</th><th>${H.L('详情', 'Detail')}</th></tr></thead>
            <tbody>${audits || '<tr><td colspan="4">—</td></tr>'}</tbody></table></div></div>`
    }));
});

/* ── audit log ── */
const AUDIT_LABELS = {
    login: ['登录成功', 'Signed in'],
    'login-fail': ['登录失败', 'Sign-in failed'],
    'login-locked': ['登录锁定', 'Sign-in locked'],
    logout: ['退出登录', 'Signed out'],
    save: ['保存内容', 'Content saved'],
    delete: ['删除内容', 'Content deleted'],
    reorder: ['调整排序', 'Content reordered'],
    upload: ['上传图片', 'Image uploaded'],
    'media-delete': ['删除图片', 'Image deleted'],
    restore: ['恢复版本', 'Version restored'],
    settings: ['更新设置', 'Settings updated'],
    'username-change': ['修改用户名', 'Username changed'],
    'username-change-fail': ['用户名修改失败', 'Username change failed'],
    'password-change': ['修改密码', 'Password changed'],
    'password-change-fail': ['密码修改失败', 'Password change failed'],
    'user-create': ['创建账号', 'User created'],
    'lead-delete': ['删除线索', 'Lead deleted'],
    lead: ['收到线索', 'Lead received'],
    'news-draft-save': ['保存新闻草稿', 'News draft saved'],
    'news-draft-reject': ['拒绝新闻草稿', 'News draft rejected'],
    'news-draft-publish': ['发布新闻草稿', 'News draft published'],
    'news-fetch': ['抓取新闻', 'News fetched'],
    'audit-export': ['导出日志', 'Audit log exported']
};

function auditLabel(action) {
    const labels = AUDIT_LABELS[action];
    return labels ? H.L(labels[0], labels[1]) : H.esc(action);
}

function auditTone(action) {
    if (/fail|locked|delete|reject/.test(action)) return ' danger';
    if (/login$|save|upload|restore|publish|create|change$/.test(action)) return ' success';
    return '';
}

function auditParams(filters, page) {
    const params = new URLSearchParams();
    ['user', 'action', 'q', 'from', 'to'].forEach(function (key) {
        if (filters[key]) params.set(key, filters[key]);
    });
    if (page && page > 1) params.set('page', String(page));
    return params.toString();
}

function auditOption(value, current, label) {
    return `<option value="${H.esc(value)}"${value === current ? ' selected' : ''}>${H.esc(label || value)}</option>`;
}

router.get('/audit', function (req, res) {
    const result = queryAudit(req.query, { perPage: 50 });
    const f = result.filters;
    const userOptions = result.users.map(function (user) { return auditOption(user, f.user); }).join('');
    const actionOptions = result.actions.map(function (action) {
        const labels = AUDIT_LABELS[action];
        return auditOption(action, f.action, labels ? `${labels[0]} / ${labels[1]}` : action);
    }).join('');
    const rows = result.entries.map(function (row) {
        return `<tr>
            <td data-label="时间 When"><time class="mono nowrap audit-time" datetime="${H.esc(row.at)}">${H.esc(formatLocal(row.at))}</time></td>
            <td data-label="用户 User"><span class="audit-user">${H.esc(row.user)}</span></td>
            <td data-label="动作 Action"><span class="audit-action${auditTone(row.action)}">${auditLabel(row.action)}</span></td>
            <td data-label="详情 Detail" class="audit-detail">${H.esc(row.detail) || '<span class="dim">—</span>'}</td>
        </tr>`;
    }).join('');
    const exportQuery = auditParams(f);
    const pageHref = function (page) {
        const q = auditParams(f, page);
        return `${req.baseUrl}/audit${q ? '?' + q : ''}`;
    };
    const pager = result.pages > 1 ? `<nav class="pager" aria-label="Audit log pagination">
        ${result.page > 1 ? `<a class="btn-ghost" href="${H.esc(pageHref(result.page - 1))}">${H.L('上一页', 'Previous')}</a>` : '<span></span>'}
        <span class="pager-status">${H.esc(result.page)} / ${H.esc(result.pages)}</span>
        ${result.page < result.pages ? `<a class="btn-ghost" href="${H.esc(pageHref(result.page + 1))}">${H.L('下一页', 'Next')}</a>` : '<span></span>'}
    </nav>` : '';

    res.send(H.layout({
        base: req.baseUrl, active: 'audit', user: req.adminUser,
        title: '操作日志', titleEn: 'Audit log',
        actions: `<a class="btn-primary" href="${req.baseUrl}/audit/export.csv${exportQuery ? '?' + H.esc(exportQuery) : ''}"><i data-lucide="download"></i>${H.L('导出 CSV', 'Export CSV')}</a>`,
        body: `<div class="hintbox">${H.L(
            '记录时间按赞比亚时间显示。日志只追加、不提供删除入口，可用于追踪登录、内容发布、账号和安全操作。',
            'Times are shown in Zambia time. Logs are append-only with no delete control, covering sign-ins, publishing, account and security actions.')}</div>
        <div class="audit-stats" aria-label="Audit log summary">
            <div class="audit-stat"><span>${H.L('匹配记录', 'Matching entries')}</span><strong>${H.esc(result.total)}</strong></div>
            <div class="audit-stat"><span>${H.L('涉及用户', 'Users')}</span><strong>${H.esc(result.stats.users)}</strong></div>
            <div class="audit-stat"><span>${H.L('今日记录', 'Today')}</span><strong>${H.esc(result.stats.today)}</strong></div>
            <div class="audit-stat"><span>${H.L('安全告警', 'Security alerts')}</span><strong>${H.esc(result.stats.security)}</strong></div>
        </div>
        <form class="audit-filter" method="get" action="${req.baseUrl}/audit">
            <div class="field"><label class="flabel" for="audit-user">${H.L('用户', 'User')}</label><select class="inp" id="audit-user" name="user"><option value="">全部 All</option>${userOptions}</select></div>
            <div class="field"><label class="flabel" for="audit-action">${H.L('动作', 'Action')}</label><select class="inp" id="audit-action" name="action"><option value="">全部 All</option>${actionOptions}</select></div>
            <div class="field audit-query"><label class="flabel" for="audit-q">${H.L('关键词', 'Keyword')}</label><input class="inp" id="audit-q" name="q" value="${H.esc(f.q)}" maxlength="120" placeholder="用户、动作或详情 User, action or detail"></div>
            <div class="field"><label class="flabel" for="audit-from">${H.L('开始日期', 'From')}</label><input class="inp" id="audit-from" type="date" name="from" value="${H.esc(f.from)}"></div>
            <div class="field"><label class="flabel" for="audit-to">${H.L('结束日期', 'To')}</label><input class="inp" id="audit-to" type="date" name="to" value="${H.esc(f.to)}"></div>
            <div class="audit-filter-actions"><button class="btn-primary" type="submit"><i data-lucide="search"></i>${H.L('筛选', 'Filter')}</button><a class="btn-ghost" href="${req.baseUrl}/audit">${H.L('重置', 'Reset')}</a></div>
        </form>
        <div class="audit-result-head"><span>${H.L('共 ' + result.total + ' 条', result.total + ' entries')}</span><span>${H.L('每页 50 条', '50 per page')}</span></div>
        <div class="tablewrap"><table class="ltable audit-table"><thead><tr>
            <th>${H.L('时间', 'When')}</th><th>${H.L('用户', 'User')}</th><th>${H.L('动作', 'Action')}</th><th>${H.L('详情', 'Detail')}</th>
        </tr></thead><tbody>${rows || `<tr><td class="audit-empty" colspan="4"><div class="empty">${H.L('没有符合条件的日志，请调整筛选条件。', 'No matching logs. Try changing the filters.')}</div></td></tr>`}</tbody></table></div>
        ${pager}`
    }));
});

function csvCell(value) {
    let text = String(value == null ? '' : value).replace(/[\r\n]+/g, ' ');
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
}

router.get('/audit/export.csv', function (req, res) {
    const result = queryAudit(req.query, { all: true, limit: 10000 });
    const lines = [['Time Zambia', 'User', 'Action', 'Detail'].map(csvCell).join(',')].concat(result.entries.map(function (row) {
        return [formatLocal(row.at), row.user, row.action, row.detail].map(csvCell).join(',');
    }));
    audit(req.adminUser.username, 'audit-export', `rows=${result.entries.length}${result.truncated ? ' limited' : ''}`);
    res.set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="roofy-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store'
    });
    res.send('\uFEFF' + lines.join('\r\n') + '\r\n');
});

/* ── media library ── */
router.get('/media', function (req, res) {
    const folder = String(req.query.folder || '');
    const images = uploads.listImages(folder);
    const tabs = [''].concat(uploads.FOLDERS).map(function (f) {
        const label = f === '' ? '全部 All' : f;
        const active = f === folder ? ' active' : '';
        return `<a class="tab${active}" href="${req.baseUrl}/media${f ? '?folder=' + f : ''}">${H.esc(label)}</a>`;
    }).join('');
    const grid = images.map(function (im) {
        return `<div class="mcell" data-path="${H.esc(im.path)}">
            <img src="${req.baseUrl}/site-assets${H.esc(im.path)}" loading="lazy" alt="">
            <div class="mmeta"><span class="mono">${H.esc(im.name)}</span><span>${Math.round(im.size / 1024)}KB</span></div>
            <div class="mops">
                <button class="btn-sm act-copy" data-copy="${H.esc(im.path)}">${H.L('复制路径', 'Copy path')}</button>
                <button class="btn-sm danger act-media-del">${H.L('删除', 'Delete')}</button>
            </div></div>`;
    }).join('');
    res.send(H.layout({
        base: req.baseUrl, active: 'media', user: req.adminUser,
        title: '图片库', titleEn: 'Media library',
        actions: `<label class="btn-primary upl"><input type="file" id="media-upload" accept="image/*" multiple hidden data-folder="${H.esc(folder || 'misc')}">+ ${H.L('上传图片', 'Upload')}</label>`,
        body: `<div class="hintbox">${H.L('上传自动压缩为最长边 1600px 的 JPG。被内容引用的图片无法删除。当前上传目录:' + (folder || 'misc'), 'Uploads are recompressed to ≤1600px JPG. Images referenced by content cannot be deleted. Current upload folder: ' + (folder || 'misc'))}</div>
        <div class="tabs">${tabs}</div>
        <div class="mgrid" id="media-grid">${grid || '<div class="empty">空 empty</div>'}</div>`
    }));
});

/* ── history ── */
router.get('/history', async function (req, res) {
    let commits = [];
    try { commits = await gitops.log(['site/assets/data', 'site/assets/js/settings.js'], 50); } catch (e) { /* empty */ }
    const withFiles = [];
    for (const c of commits) {
        let files = [];
        try {
            files = (await gitops.commitFiles(c.sha)).filter(function (f) {
                return /^site\/assets\/(data\/|js\/settings\.js)/.test(f);
            });
        } catch (e) { /* skip */ }
        withFiles.push(Object.assign({ files }, c));
    }
    const rows = withFiles.map(function (c) {
        const fileBtns = c.files.map(function (f) {
            const short = f.replace('site/assets/data/', '').replace('site/assets/js/', '');
            return `<button class="btn-sm act-restore" data-sha="${H.esc(c.sha)}" data-file="${H.esc(f)}"
                title="把 ${H.esc(short)} 恢复到该版本 restore ${H.esc(short)} to this commit">⟲ ${H.esc(short)}</button>`;
        }).join(' ');
        return `<tr><td class="mono">${H.esc(c.sha)}</td><td>${H.esc(c.subject)}</td>
            <td>${H.esc(c.author)}</td><td>${H.esc(c.date)}</td><td>${fileBtns || '—'}</td></tr>`;
    }).join('');
    res.send(H.layout({
        base: req.baseUrl, active: 'history', user: req.adminUser,
        title: '发布历史', titleEn: 'Publish history',
        body: `<div class="hintbox">${H.L('每次保存都是一个版本。点击 ⟲ 可把单个数据文件恢复到那个版本的内容(恢复本身也会成为一条新记录,不会丢失任何历史)。',
            'Every save is a version. Click ⟲ to restore a single data file to that commit — the restore is itself a new commit, so nothing is ever lost.')}</div>
        <div class="tablewrap"><table class="ltable" id="history-table"><thead>
        <tr><th>commit</th><th>${H.L('内容', 'Subject')}</th><th>${H.L('操作人', 'By')}</th><th>${H.L('时间', 'When')}</th><th>${H.L('恢复文件', 'Restore file')}</th></tr>
        </thead><tbody>${rows || '<tr><td colspan="5">—</td></tr>'}</tbody></table></div>`
    }));
});

/* ── settings ── */
router.get('/settings', function (req, res) {
    const { json: s, sha } = store.readSettings();
    function inp(name, label, labelEn, value, hint) {
        return `<div class="field full"><label class="flabel">${H.L(label, labelEn)}</label>
            <input class="inp" name="${name}" value="${H.esc(value)}">${hint ? `<div class="fhint">${H.esc(hint)}</div>` : ''}</div>`;
    }
    res.send(H.layout({
        base: req.baseUrl, active: 'settings', user: req.adminUser,
        title: '站点设置', titleEn: 'Site settings',
        body: `<div class="hintbox">${H.L('这些设置保存后写入 settings.js 并立即对全站生效:WhatsApp 悬浮按钮号码、统计代码、页脚社媒图标(留空的图标不显示)。',
            'Saved values are written to settings.js and apply sitewide immediately: WhatsApp FAB number, analytics IDs, footer social icons (empty = hidden).')}</div>
        <form id="settings-form" class="cform" data-base-sha="${H.esc(sha)}">
        <div class="fgrid">
        ${inp('whatsapp', 'WhatsApp 号码', 'WhatsApp number', s.whatsapp, '含国家码纯数字,如 260964813736 — digits only, with country code')}
        ${inp('ga4Id', 'GA4 衡量 ID', 'GA4 measurement ID', s.ga4Id, 'G-XXXXXXXXXX,留空不启用 — empty disables')}
        ${inp('pixelId', 'Meta Pixel ID', 'Meta Pixel ID', s.pixelId, '纯数字,留空不启用 — empty disables')}
        ${inp('social.instagram', 'Instagram 链接', 'Instagram URL', s.social.instagram, 'https:// 开头,留空隐藏图标')}
        ${inp('social.facebook', 'Facebook 链接', 'Facebook URL', s.social.facebook, '')}
        ${inp('social.linkedin', 'LinkedIn 链接', 'LinkedIn URL', s.social.linkedin, '')}
        ${inp('social.youtube', 'YouTube 链接', 'YouTube URL', s.social.youtube, '')}
        </div>
        <div class="formbar"><button type="submit" class="btn-primary">${H.L('保存并发布', 'Save & publish')}</button><span class="savemsg" id="savemsg"></span></div>
        </form>`
    }));
});

/* ── account ── */
router.get('/account', function (req, res) {
    res.send(H.layout({
        base: req.baseUrl, active: 'account', user: req.adminUser,
        title: '账号', titleEn: 'Account',
        body: `<div class="panel"><h2>${H.L('修改用户名', 'Change username')}</h2>
        <form id="username-form" class="cform narrow">
        <div class="field full"><label class="flabel" for="account-username">${H.L('新用户名', 'New username')}</label><input id="account-username" class="inp" name="newUsername" value="${H.esc(req.adminUser.username)}" autocomplete="username" pattern="[a-z0-9_-]{2,24}" minlength="2" maxlength="24" required><div class="fieldhelp">${H.L('使用 2 至 24 位小写英文字母、数字、下划线或连字符。', 'Use 2–24 lowercase letters, numbers, underscores or hyphens.')}</div></div>
        <div class="field full"><label class="flabel" for="username-password">${H.L('当前密码', 'Current password')}</label><input id="username-password" class="inp" type="password" name="password" autocomplete="current-password" required></div>
        <div class="formbar"><button type="submit" class="btn-primary">${H.L('更新用户名', 'Update username')}</button><span class="savemsg" id="username-savemsg" role="status" aria-live="polite"></span></div>
        </form></div>
        <div class="panel"><h2>${H.L('修改密码', 'Change password')}</h2>
        <form id="password-form" class="cform narrow">
        <div class="field full"><label class="flabel" for="current-password">${H.L('当前密码', 'Current password')}</label><input id="current-password" class="inp" type="password" name="oldPw" autocomplete="current-password" required></div>
        <div class="field full"><label class="flabel" for="new-password">${H.L('新密码(至少 10 位)', 'New password (min 10 chars)')}</label><input id="new-password" class="inp" type="password" name="newPw" autocomplete="new-password" minlength="10" required></div>
        <div class="field full"><label class="flabel" for="repeat-password">${H.L('重复新密码', 'Repeat new password')}</label><input id="repeat-password" class="inp" type="password" name="newPw2" autocomplete="new-password" minlength="10" required></div>
        <div class="formbar"><button type="submit" class="btn-primary">${H.L('更新密码', 'Update password')}</button><span class="savemsg" id="savemsg" role="status" aria-live="polite"></span></div>
        </form></div>`
    }));
});

router.post('/api/account/username', function (req, res) {
    const oldUsername = req.adminUser.username;
    const result = auth.changeUsername(oldUsername, req.body && req.body.newUsername, String((req.body && req.body.password) || ''));
    if (!result.ok) {
        audit(oldUsername, 'username-change-fail', `${result.error} ${req.ip}`);
        const errors = {
            invalid: '用户名格式不正确 — use 2–24 lowercase letters, numbers, underscores or hyphens',
            password: '当前密码不正确 — current password incorrect',
            taken: '该用户名已被使用 — username already taken'
        };
        return res.json({ ok: false, errors: [errors[result.error] || '更新失败 — update failed'] });
    }
    if (!result.unchanged) audit(result.username, 'username-change', oldUsername + ' -> ' + result.username);
    res.json({ ok: true, username: result.username, unchanged: !!result.unchanged });
});

router.post('/api/account/password', function (req, res) {
    const { oldPw, newPw, newPw2 } = req.body || {};
    if (!newPw || newPw !== newPw2) {
        audit(req.adminUser.username, 'password-change-fail', `mismatch ${req.ip}`);
        return res.json({ ok: false, errors: ['两次输入的新密码不一致 — new passwords do not match'] });
    }
    if (String(newPw).length < 10) {
        audit(req.adminUser.username, 'password-change-fail', `too-short ${req.ip}`);
        return res.json({ ok: false, errors: ['新密码至少 10 位 — at least 10 characters'] });
    }
    const ok = auth.changePassword(req.adminUser.username, String(oldPw || ''), String(newPw));
    if (!ok) {
        audit(req.adminUser.username, 'password-change-fail', `current-password ${req.ip}`);
        return res.json({ ok: false, errors: ['当前密码不正确 — current password incorrect'] });
    }
    audit(req.adminUser.username, 'password-change', req.ip);
    res.json({ ok: true });
});

/* ── leads (public contact-form submissions) ── */
const INTEREST_L = {
    realestate: ['房地产', 'Real estate'], led: ['LED 广告', 'LED ads'],
    branding: ['品牌策划', 'Branding'], other: ['其他', 'Other']
};

router.get('/leads', function (req, res) {
    const list = leads.all().reverse();   // newest first
    const rows = list.map(function (l) {
        const il = INTEREST_L[l.interest] || INTEREST_L.other;
        const when = H.esc((l.at || '').replace('T', ' ').slice(0, 16));
        const phone = l.phone ? `<div class="dim">${H.esc(l.phone)}</div>` : '';
        const wa = l.phone ? ` · <a href="https://wa.me/${H.esc(String(l.phone).replace(/[^\d]/g, ''))}" target="_blank" rel="noopener">WhatsApp</a>` : '';
        return `<tr class="${l.read ? '' : 'lead-unread'}" data-id="${H.esc(l.id)}">
            <td class="nowrap">${when}</td>
            <td><strong>${H.esc(l.name)}</strong></td>
            <td><a href="mailto:${H.esc(l.email)}">${H.esc(l.email)}</a>${phone}${wa}</td>
            <td>${H.L(il[0], il[1])}</td>
            <td style="white-space:pre-line">${H.esc(l.message)}</td>
            <td class="ops"><button class="btn-sm danger act-lead-del">${H.L('删除', 'Delete')}</button></td>
        </tr>`;
    }).join('');
    leads.markAllRead();   // viewing the inbox clears the unread badge
    res.send(H.layout({
        base: req.baseUrl, active: 'leads', user: req.adminUser,
        title: '咨询线索', titleEn: 'Leads',
        body: `<div class="hintbox">${H.L(
            '网站联系表单的提交都会进入这里。这些数据只保存在服务器本地,不进 git、不公开。点邮箱直接回复,或用 WhatsApp 跟进。',
            'Contact-form submissions land here. They are stored only on the server — never committed to git, never public. Click an email to reply, or follow up on WhatsApp.')}</div>
        <div class="tablewrap"><table class="ltable" id="leads-table">
        <thead><tr><th>${H.L('时间', 'When')}</th><th>${H.L('姓名', 'Name')}</th><th>${H.L('联系方式', 'Contact')}</th><th>${H.L('意向', 'Interest')}</th><th>${H.L('留言', 'Message')}</th><th class="ops-col">${H.L('操作', 'Actions')}</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6"><div class="empty">${H.L('暂无线索', 'No leads yet')}</div></td></tr>`}</tbody>
        </table></div>`
    }));
});

router.post('/api/leads/delete', function (req, res) {
    const id = String((req.body || {}).id || '');
    if (!/^[0-9a-f]{8,32}$/.test(id)) return res.json({ ok: false, errors: ['bad id'] });
    try {
        leads.remove(id);
        audit(req.adminUser.username, 'lead-delete', id);
        res.json({ ok: true });
    } catch (e) { res.json({ ok: false, errors: [e.message] }); }
});

module.exports = router;
