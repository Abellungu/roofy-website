/* ROOFY Admin client: widget editors (paragraphs / pairs / matrix / sections /
 * images), form collection, save/delete/reorder, media library modal. */
(function () {
    'use strict';
    var BASE = window.ADMIN_BASE || '/admin';
    var ASSET = BASE + '/site-assets';
    var widgets = {};   // field name -> {collect()}
    var dirty = false;

    /* ── helpers ── */
    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function toast(msg, bad) {
        var t = document.getElementById('toast');
        var item = el('div', 'toast-item' + (bad ? ' bad' : ''), esc(msg));
        t.appendChild(item);
        setTimeout(function () { item.classList.add('show'); }, 10);
        setTimeout(function () { item.classList.remove('show'); setTimeout(function () { item.remove(); }, 300); }, 3800);
    }
    function post(url, body) {
        return fetch(BASE + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'roofy-admin' },
            body: JSON.stringify(body || {})
        }).then(function (r) {
            if (r.status === 401) { location.href = BASE + '/login'; throw new Error('unauthorized'); }
            return r.json();
        });
    }
    function markDirty() { dirty = true; }
    window.addEventListener('beforeunload', function (e) {
        if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });

    /* ── media library modal ── */
    function openLibrary(folder, onPick) {
        var overlay = el('div', 'modal-overlay');
        var box = el('div', 'modal');
        box.innerHTML = '<div class="modal-head"><b>图片库 Media library</b><button class="btn-sm act-close">✕</button></div>' +
            '<div class="modal-body"><div class="mgrid small" id="lib-grid">加载中 loading…</div></div>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.closest('.act-close')) overlay.remove();
        });
        fetch(BASE + '/api/media/list' + (folder ? '?folder=' + encodeURIComponent(folder) : ''))
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var grid = box.querySelector('#lib-grid');
                grid.innerHTML = (d.images || []).map(function (im) {
                    return '<div class="mcell pick" data-path="' + esc(im.path) + '">' +
                        '<img src="' + ASSET + esc(im.path) + '" loading="lazy" alt="">' +
                        '<div class="mmeta"><span>' + esc(im.name) + '</span></div></div>';
                }).join('') || '<div class="empty">空 empty — 请先上传 upload first</div>';
                grid.addEventListener('click', function (e) {
                    var cell = e.target.closest('.mcell');
                    if (!cell) return;
                    onPick(cell.getAttribute('data-path'));
                    overlay.remove();
                });
            });
    }

    function uploadFiles(files, folder) {
        var fd = new FormData();
        for (var i = 0; i < files.length; i++) fd.append('files', files[i]);
        fd.append('folder', folder || 'misc');
        return fetch(BASE + '/api/upload', { method: 'POST', headers: { 'X-Requested-With': 'roofy-admin' }, body: fd })
            .then(function (r) { return r.json(); });
    }

    /* ── widget: single image ── */
    function initImgPick(root) {
        var input = root.querySelector('input[type=hidden]');
        var prev = root.querySelector('.imgprev');
        var folder = root.getAttribute('data-folder');
        function setVal(p) {
            input.value = p || '';
            prev.innerHTML = p ? '<img src="' + ASSET + esc(p) + '" alt="">' : '<span class="noimg">未选择 none</span>';
            markDirty();
        }
        root.querySelector('.act-upload').addEventListener('click', function () {
            var f = el('input'); f.type = 'file'; f.accept = 'image/*';
            f.addEventListener('change', function () {
                if (!f.files.length) return;
                toast('上传中 uploading…');
                uploadFiles(f.files, folder).then(function (d) {
                    if (d.ok) { setVal(d.paths[0]); toast('上传成功 uploaded'); }
                    else toast((d.errors || ['上传失败 upload failed']).join('; '), true);
                });
            });
            f.click();
        });
        root.querySelector('.act-library').addEventListener('click', function () { openLibrary('', setVal); });
        root.querySelector('.act-clear').addEventListener('click', function () { setVal(''); });
    }

    /* ── widget: image list ── */
    function initImgList(root) {
        var name = root.getAttribute('data-name');
        var folder = root.getAttribute('data-folder');
        var paths = JSON.parse(root.getAttribute('data-value') || '[]');
        function render() {
            root.innerHTML = paths.map(function (p, i) {
                return '<div class="ilcell" data-i="' + i + '">' +
                    '<img src="' + ASSET + esc(p) + '" alt="">' +
                    '<div class="ilops"><button type="button" class="btn-sm act-l">←</button>' +
                    '<button type="button" class="btn-sm danger act-x">✕</button>' +
                    '<button type="button" class="btn-sm act-r">→</button></div></div>';
            }).join('') +
                '<div class="iladd"><button type="button" class="btn-sm act-add-up">+ 上传 Upload</button>' +
                '<button type="button" class="btn-sm act-add-lib">+ 图库 Library</button></div>';
        }
        root.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            var cell = e.target.closest('.ilcell');
            var i = cell ? Number(cell.getAttribute('data-i')) : -1;
            if (b.classList.contains('act-x')) { paths.splice(i, 1); render(); markDirty(); }
            else if (b.classList.contains('act-l') && i > 0) { var t = paths[i - 1]; paths[i - 1] = paths[i]; paths[i] = t; render(); markDirty(); }
            else if (b.classList.contains('act-r') && i < paths.length - 1) { var u = paths[i + 1]; paths[i + 1] = paths[i]; paths[i] = u; render(); markDirty(); }
            else if (b.classList.contains('act-add-lib')) openLibrary('', function (p) { paths.push(p); render(); markDirty(); });
            else if (b.classList.contains('act-add-up')) {
                var f = el('input'); f.type = 'file'; f.accept = 'image/*'; f.multiple = true;
                f.addEventListener('change', function () {
                    if (!f.files.length) return;
                    toast('上传中 uploading…');
                    uploadFiles(f.files, folder).then(function (d) {
                        if (d.ok) { paths = paths.concat(d.paths); render(); markDirty(); toast('上传成功 uploaded'); }
                        else toast((d.errors || ['failed']).join('; '), true);
                    });
                });
                f.click();
            }
        });
        render();
        widgets[name] = { collect: function () { return paths.slice(); } };
    }

    /* ── widget: paragraphs ── */
    function paraEditor(root, initial, onChange) {
        var items = (initial || []).slice();
        function render() {
            root.innerHTML = items.map(function (p, i) {
                return '<div class="prow" data-i="' + i + '">' +
                    '<textarea class="inp ta" rows="3">' + esc(p) + '</textarea>' +
                    '<div class="pops"><button type="button" class="btn-sm act-u">↑</button>' +
                    '<button type="button" class="btn-sm act-d">↓</button>' +
                    '<button type="button" class="btn-sm danger act-x">✕</button></div></div>';
            }).join('') + '<button type="button" class="btn-sm act-add">+ 添加段落 Add paragraph</button>';
        }
        function sync() {
            items = Array.prototype.map.call(root.querySelectorAll('.prow textarea'), function (t) { return t.value; });
        }
        root.addEventListener('input', function () { sync(); onChange(); });
        root.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            sync();
            var row = e.target.closest('.prow');
            var i = row ? Number(row.getAttribute('data-i')) : -1;
            if (b.classList.contains('act-add')) items.push('');
            else if (b.classList.contains('act-x')) items.splice(i, 1);
            else if (b.classList.contains('act-u') && i > 0) { var t = items[i - 1]; items[i - 1] = items[i]; items[i] = t; }
            else if (b.classList.contains('act-d') && i < items.length - 1) { var u = items[i + 1]; items[i + 1] = items[i]; items[i] = u; }
            else return;
            render(); onChange();
        });
        render();
        return { collect: function () { sync(); return items.filter(function (s) { return s.trim(); }); } };
    }
    function initParas(root) {
        var name = root.getAttribute('data-name');
        widgets[name] = paraEditor(root, JSON.parse(root.getAttribute('data-value') || '[]'), markDirty);
    }

    /* ── widget: zh/en pair list ── */
    function initPairlist(root) {
        var name = root.getAttribute('data-name');
        var rows = JSON.parse(root.getAttribute('data-value') || '[]');
        function render() {
            root.innerHTML = rows.map(function (r, i) {
                return '<div class="pairrow" data-i="' + i + '">' +
                    '<input class="inp" data-k="zh" placeholder="中文" value="' + esc(r.zh) + '">' +
                    '<input class="inp" data-k="en" placeholder="English" value="' + esc(r.en) + '">' +
                    '<div class="pops"><button type="button" class="btn-sm act-u">↑</button>' +
                    '<button type="button" class="btn-sm act-d">↓</button>' +
                    '<button type="button" class="btn-sm danger act-x">✕</button></div></div>';
            }).join('') + '<button type="button" class="btn-sm act-add">+ 添加一行 Add row</button>';
        }
        function sync() {
            rows = Array.prototype.map.call(root.querySelectorAll('.pairrow'), function (pr) {
                return { zh: pr.querySelector('[data-k=zh]').value, en: pr.querySelector('[data-k=en]').value };
            });
        }
        root.addEventListener('input', function () { sync(); markDirty(); });
        root.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            sync();
            var row = e.target.closest('.pairrow');
            var i = row ? Number(row.getAttribute('data-i')) : -1;
            if (b.classList.contains('act-add')) rows.push({ zh: '', en: '' });
            else if (b.classList.contains('act-x')) rows.splice(i, 1);
            else if (b.classList.contains('act-u') && i > 0) { var t = rows[i - 1]; rows[i - 1] = rows[i]; rows[i] = t; }
            else if (b.classList.contains('act-d') && i < rows.length - 1) { var u = rows[i + 1]; rows[i + 1] = rows[i]; rows[i] = u; }
            else return;
            render(); markDirty();
        });
        render();
        widgets[name] = { collect: function () { sync(); return rows; } };
    }

    /* ── widget: matrix (N columns) ── */
    function initMatrix(root) {
        var name = root.getAttribute('data-name');
        var cols = JSON.parse(root.getAttribute('data-cols') || '[]');
        var rows = JSON.parse(root.getAttribute('data-value') || '[]');
        function render() {
            var head = '<div class="mxhead">' + cols.map(function (c) {
                return '<span>' + esc(c.zh) + ' <i>' + esc(c.en) + '</i></span>';
            }).join('') + '<span></span></div>';
            root.innerHTML = head + rows.map(function (r, i) {
                var cells = cols.map(function (c) {
                    return c.wide
                        ? '<textarea class="inp ta" rows="2" data-k="' + esc(c.key) + '">' + esc(r[c.key]) + '</textarea>'
                        : '<input class="inp" data-k="' + esc(c.key) + '" value="' + esc(r[c.key]) + '">';
                }).join('');
                return '<div class="mxrow" data-i="' + i + '">' + cells +
                    '<div class="pops"><button type="button" class="btn-sm act-u">↑</button>' +
                    '<button type="button" class="btn-sm act-d">↓</button>' +
                    '<button type="button" class="btn-sm danger act-x">✕</button></div></div>';
            }).join('') + '<button type="button" class="btn-sm act-add">+ 添加一行 Add row</button>';
            root.style.setProperty('--mxcols', cols.length);
        }
        function sync() {
            rows = Array.prototype.map.call(root.querySelectorAll('.mxrow'), function (mr) {
                var o = {};
                cols.forEach(function (c) { o[c.key] = mr.querySelector('[data-k=' + c.key + ']').value; });
                return o;
            });
        }
        root.addEventListener('input', function () { sync(); markDirty(); });
        root.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            sync();
            var row = e.target.closest('.mxrow');
            var i = row ? Number(row.getAttribute('data-i')) : -1;
            if (b.classList.contains('act-add')) { var o = {}; cols.forEach(function (c) { o[c.key] = ''; }); rows.push(o); }
            else if (b.classList.contains('act-x')) rows.splice(i, 1);
            else if (b.classList.contains('act-u') && i > 0) { var t = rows[i - 1]; rows[i - 1] = rows[i]; rows[i] = t; }
            else if (b.classList.contains('act-d') && i < rows.length - 1) { var u = rows[i + 1]; rows[i + 1] = rows[i]; rows[i] = u; }
            else return;
            render(); markDirty();
        });
        render();
        widgets[name] = { collect: function () { sync(); return rows; } };
    }

    /* ── widget: legal sections ── */
    function initSections(root) {
        var name = root.getAttribute('data-name');
        var sections = JSON.parse(root.getAttribute('data-value') || '[]');
        var paraEditors = [];
        function render() {
            paraEditors = [];
            root.innerHTML = '';
            sections.forEach(function (s, i) {
                var block = el('div', 'secblock');
                block.setAttribute('data-i', i);
                block.innerHTML = '<div class="sechead">' +
                    '<input class="inp sec-h" placeholder="章节标题 heading" value="' + esc(s.heading) + '">' +
                    '<div class="pops"><button type="button" class="btn-sm act-su">↑</button>' +
                    '<button type="button" class="btn-sm act-sd">↓</button>' +
                    '<button type="button" class="btn-sm danger act-sx">✕</button></div></div>' +
                    '<div class="secbody"></div>';
                root.appendChild(block);
                paraEditors.push(paraEditor(block.querySelector('.secbody'), s.body, markDirty));
            });
            var add = el('button', 'btn-sm', '+ 添加章节 Add section');
            add.type = 'button'; add.setAttribute('data-act', 'add-section');
            root.appendChild(add);
        }
        function sync() {
            sections = Array.prototype.map.call(root.querySelectorAll('.secblock'), function (b, i) {
                return { heading: b.querySelector('.sec-h').value, body: paraEditors[i].collect() };
            });
        }
        root.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            if (b.getAttribute('data-act') === 'add-section') { sync(); sections.push({ heading: '', body: [''] }); render(); markDirty(); return; }
            if (!/act-s[udx]/.test(b.className)) return;
            sync();
            var i = Number(e.target.closest('.secblock').getAttribute('data-i'));
            if (b.classList.contains('act-sx')) sections.splice(i, 1);
            else if (b.classList.contains('act-su') && i > 0) { var t = sections[i - 1]; sections[i - 1] = sections[i]; sections[i] = t; }
            else if (b.classList.contains('act-sd') && i < sections.length - 1) { var u = sections[i + 1]; sections[i + 1] = sections[i]; sections[i] = u; }
            else return;
            render(); markDirty();
        });
        root.addEventListener('input', markDirty);
        render();
        widgets[name] = { collect: function () { sync(); return sections; } };
    }

    /* ── content form ── */
    function collectForm(form) {
        var data = {};
        form.querySelectorAll('[name][data-ftype]').forEach(function (inp) {
            var t = inp.getAttribute('data-ftype');
            if (t === 'bool') data[inp.name] = inp.checked;
            else if (t === 'number') data[inp.name] = inp.value === '' ? '' : inp.value;
            else data[inp.name] = inp.value;
        });
        Object.keys(widgets).forEach(function (name) { data[name] = widgets[name].collect(); });
        return data;
    }

    function showResult(d, msgEl) {
        if (!d.ok) {
            msgEl.innerHTML = '<div class="errbox">' + (d.errors || ['失败 failed']).map(esc).join('<br>') + '</div>';
            toast('保存失败 save failed', true);
            return false;
        }
        var html = '<span class="okmsg">✓ 已发布 published' + (d.commit ? ' · ' + esc(d.commit) : '') + '</span>';
        if (d.warnings && d.warnings.length) {
            html += '<div class="warnbox">' + d.warnings.map(esc).join('<br>') + '</div>';
        }
        msgEl.innerHTML = html;
        toast('已保存并发布 saved & published');
        return true;
    }

    function initContentForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('.btn-primary');
            btn.disabled = true;
            var isNew = form.getAttribute('data-is-new') === '1';
            var data = collectForm(form);
            post('/api/c/' + form.getAttribute('data-type') + '/save', {
                id: isNew ? null : form.getAttribute('data-id'),
                isNew: isNew, data: data,
                baseSha: form.getAttribute('data-base-sha')
            }).then(function (d) {
                btn.disabled = false;
                if (showResult(d, document.getElementById('savemsg'))) {
                    dirty = false;
                    form.setAttribute('data-base-sha', d.newSha);
                    if (isNew) location.href = BASE + '/c/' + form.getAttribute('data-type') + '/' + encodeURIComponent(d.id);
                }
            }).catch(function (err) { btn.disabled = false; toast(err.message, true); });
        });
        form.addEventListener('input', markDirty);
    }

    /* ── list table ── */
    function initListTable(table) {
        var type = table.getAttribute('data-type');
        var tbody = table.querySelector('tbody');
        var bar = null;
        function showSaveOrder() {
            if (bar) return;
            bar = el('div', 'orderbar', '<button class="btn-primary act-save-order">保存排序 Save order</button>');
            table.parentNode.appendChild(bar);
            bar.querySelector('button').addEventListener('click', function () {
                var ids = Array.prototype.map.call(tbody.querySelectorAll('tr'), function (tr) { return tr.getAttribute('data-id'); });
                post('/api/c/' + type + '/reorder', { ids: ids, baseSha: table.getAttribute('data-base-sha') })
                    .then(function (d) {
                        if (d.ok) { toast('排序已发布 order published'); location.reload(); }
                        else toast((d.errors || ['failed']).join('; '), true);
                    });
            });
        }
        table.addEventListener('click', function (e) {
            var tr = e.target.closest('tr'); if (!tr) return;
            if (e.target.closest('.act-up')) {
                var prev = tr.previousElementSibling;
                if (prev) { tbody.insertBefore(tr, prev); showSaveOrder(); }
            } else if (e.target.closest('.act-down')) {
                var next = tr.nextElementSibling;
                if (next) { tbody.insertBefore(next, tr); showSaveOrder(); }
            } else if (e.target.closest('.act-del')) {
                var id = tr.getAttribute('data-id');
                if (!confirm('确认删除「' + id + '」?此操作会立即发布。\nDelete "' + id + '"? This publishes immediately.')) return;
                post('/api/c/' + type + '/delete', { id: id, baseSha: table.getAttribute('data-base-sha') })
                    .then(function (d) {
                        if (d.ok) { tr.remove(); table.setAttribute('data-base-sha', d.newSha); toast('已删除并发布 deleted'); }
                        else toast((d.errors || ['failed']).join('; '), true);
                    });
            }
        });
    }

    /* ── settings / password / media / history pages ── */
    function initSettingsForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = { social: {} };
            form.querySelectorAll('input[name]').forEach(function (inp) {
                if (inp.name.indexOf('social.') === 0) data.social[inp.name.slice(7)] = inp.value;
                else data[inp.name] = inp.value;
            });
            post('/api/settings/save', { data: data, baseSha: form.getAttribute('data-base-sha') })
                .then(function (d) {
                    if (showResult(d, document.getElementById('savemsg'))) {
                        form.setAttribute('data-base-sha', d.newSha); dirty = false;
                    }
                });
        });
    }
    function initPasswordForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = {};
            form.querySelectorAll('input[name]').forEach(function (i) { data[i.name] = i.value; });
            post('/api/account/password', data).then(function (d) {
                if (d.ok) { toast('密码已更新 password updated'); form.reset(); document.getElementById('savemsg').innerHTML = '<span class="okmsg">✓</span>'; }
                else showResult(d, document.getElementById('savemsg'));
            });
        });
    }
    function initMediaPage() {
        var up = document.getElementById('media-upload');
        if (up) up.addEventListener('change', function () {
            if (!up.files.length) return;
            toast('上传中 uploading…');
            uploadFiles(up.files, up.getAttribute('data-folder')).then(function (d) {
                if (d.ok) location.reload(); else toast((d.errors || ['failed']).join('; '), true);
            });
        });
        var grid = document.getElementById('media-grid');
        if (grid) grid.addEventListener('click', function (e) {
            var cell = e.target.closest('.mcell'); if (!cell) return;
            var p = cell.getAttribute('data-path');
            if (e.target.closest('.act-copy')) {
                navigator.clipboard.writeText(p).then(function () { toast('已复制 copied: ' + p); });
            } else if (e.target.closest('.act-media-del')) {
                if (!confirm('确认删除该图片?\nDelete this image?')) return;
                post('/api/media/delete', { path: p }).then(function (d) {
                    if (d.ok) { cell.remove(); toast('已删除 deleted'); }
                    else toast((d.errors || ['failed']).join('; '), true);
                });
            }
        });
    }
    function initHistoryPage() {
        var table = document.getElementById('history-table');
        if (!table) return;
        table.addEventListener('click', function (e) {
            var b = e.target.closest('.act-restore'); if (!b) return;
            var file = b.getAttribute('data-file'), sha = b.getAttribute('data-sha');
            if (!confirm('把 ' + file + ' 恢复到 ' + sha + ' 的版本?会立即发布。\nRestore ' + file + ' to ' + sha + '? Publishes immediately.')) return;
            post('/api/history/restore', { sha: sha, file: file }).then(function (d) {
                if (d.ok) { toast(d.committed ? '已恢复并发布 restored' : '内容相同,无需恢复 already identical'); setTimeout(function () { location.reload(); }, 800); }
                else toast((d.errors || ['failed']).join('; '), true);
            });
        });
    }

    function initLeadsPage() {
        var table = document.getElementById('leads-table');
        if (!table) return;
        table.addEventListener('click', function (e) {
            var b = e.target.closest('.act-lead-del'); if (!b) return;
            var tr = e.target.closest('tr'); if (!tr) return;
            if (!confirm('删除这条线索?\nDelete this lead?')) return;
            post('/api/leads/delete', { id: tr.getAttribute('data-id') }).then(function (d) {
                if (d.ok) { tr.remove(); toast('已删除 deleted'); }
                else toast((d.errors || ['failed']).join('; '), true);
            });
        });
    }

    /* ── boot ── */
    document.addEventListener('DOMContentLoaded', function () {
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        document.querySelectorAll('.paras').forEach(initParas);
        document.querySelectorAll('.pairlist').forEach(initPairlist);
        document.querySelectorAll('.matrix').forEach(initMatrix);
        document.querySelectorAll('.sections').forEach(initSections);
        document.querySelectorAll('.imgpick').forEach(initImgPick);
        document.querySelectorAll('.imglist').forEach(initImgList);
        var cf = document.getElementById('content-form');
        if (cf) initContentForm(cf);
        var lt = document.getElementById('list-table');
        if (lt) initListTable(lt);
        var sf = document.getElementById('settings-form');
        if (sf) initSettingsForm(sf);
        var pf = document.getElementById('password-form');
        if (pf) initPasswordForm(pf);
        initMediaPage();
        initHistoryPage();
        initLeadsPage();
    });
})();
