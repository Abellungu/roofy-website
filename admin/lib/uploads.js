/* Image uploads: multer (memory) -> sharp -> site/assets/img/<folder>/.
 * Images are resized to max 1600px wide and recompressed to JPEG q78,
 * mirroring how the existing site assets were produced. */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const store = require('./store');

const IMG_ROOT = path.join(store.SITE, 'assets', 'img');
const FOLDERS = ['properties', 'news', 'projects', 'team', 'led', 'office', 'stock', 'misc'];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024, files: 8 }
});

function slugify(name) {
    const base = name.replace(/\.[a-z0-9]+$/i, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    return base || 'image';
}

async function processUpload(file, folder) {
    if (!FOLDERS.includes(folder)) folder = 'misc';
    const dir = path.join(IMG_ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let fname = `${slugify(file.originalname)}-${stamp}.jpg`;
    let i = 1;
    while (fs.existsSync(path.join(dir, fname))) {
        fname = `${slugify(file.originalname)}-${stamp}-${i++}.jpg`;
    }
    const out = path.join(dir, fname);
    await sharp(file.buffer, { failOn: 'none' })
        .rotate()                                  // honor EXIF orientation
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(out);
    return { webPath: `/assets/img/${folder}/${fname}`, absPath: out };
}

/* List images under a folder (or all) with sizes, newest first. */
function listImages(folder) {
    const folders = folder && FOLDERS.includes(folder) ? [folder] : FOLDERS;
    const out = [];
    for (const f of folders) {
        const dir = path.join(IMG_ROOT, f);
        if (!fs.existsSync(dir)) continue;
        for (const name of fs.readdirSync(dir)) {
            if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
            const st = fs.statSync(path.join(dir, name));
            out.push({ path: `/assets/img/${f}/${name}`, folder: f, name, size: st.size, mtime: st.mtimeMs });
        }
    }
    out.sort(function (a, b) { return b.mtime - a.mtime; });
    return out;
}

/* Where is this image referenced? Searched across data JSONs + JS + HTML. */
function findUsages(webPath) {
    const roots = [store.DATA_DIR, path.join(store.SITE, 'assets', 'js')];
    const hits = [];
    for (const root of roots) {
        for (const name of fs.readdirSync(root)) {
            if (!/\.(json|js)$/.test(name)) continue;
            const content = fs.readFileSync(path.join(root, name), 'utf8');
            if (content.includes(webPath)) hits.push(name);
        }
    }
    return hits;
}

function deleteImage(webPath) {
    if (!/^\/assets\/img\/[a-z]+\/[A-Za-z0-9._-]+$/.test(webPath)) throw new Error('bad path');
    const abs = path.join(store.SITE, webPath.replace(/^\//, ''));
    if (!abs.startsWith(IMG_ROOT)) throw new Error('bad path');
    fs.unlinkSync(abs);
    return abs;
}

module.exports = { upload, processUpload, listImages, findUsages, deleteImage, FOLDERS, IMG_ROOT };
