/* Git integration. Every save becomes a commit in the site repo; push runs in
 * the background and is allowed to fail (e.g. no credentials on the VPS yet).
 * All git operations are serialized through a single promise queue. */
const { execFile, spawn } = require('child_process');
const path = require('path');

const REPO = process.env.ROOFY_REPO || path.resolve(__dirname, '..', '..');
const BRANCH = process.env.ROOFY_BRANCH || 'corporate-portal';

let queue = Promise.resolve();

function git(args, opts) {
    return new Promise(function (resolve, reject) {
        execFile('git', args, Object.assign({ cwd: REPO, maxBuffer: 8 * 1024 * 1024 }, opts || {}),
            function (err, stdout, stderr) {
                if (err) return reject(new Error('git ' + args[0] + ': ' + (stderr || err.message).trim()));
                resolve(stdout);
            });
    });
}

/* Serialize mutating operations so two admin saves can't interleave. */
function enqueue(fn) {
    const run = queue.then(fn, fn);
    queue = run.catch(function () { });
    return run;
}

function commitPaths(paths, message, authorName, authorEmail) {
    return enqueue(async function () {
        await git(['add', '--'].concat(paths));
        // skip empty commits (e.g. save with no effective change)
        const status = await git(['status', '--porcelain', '--'].concat(paths));
        if (!status.trim()) return { committed: false };
        await git(['-c', 'user.name=ROOFY Admin', '-c', 'user.email=admin@roofyinvestments.com',
            'commit', '-m', message,
            '--author', `${authorName} <${authorEmail}>`]);
        const sha = (await git(['rev-parse', '--short', 'HEAD'])).trim();
        pushAsync();
        return { committed: true, sha };
    });
}

/* Fire-and-forget push; never blocks a save. */
function pushAsync() {
    const child = spawn('git', ['push', 'origin', BRANCH], { cwd: REPO, stdio: 'ignore', detached: true });
    child.on('error', function () { });
    child.unref();
}

async function log(paths, limit) {
    const out = await git(['log', '--pretty=format:%h|%an|%ad|%s', '--date=format:%Y-%m-%d %H:%M',
        '-n', String(limit || 40), '--'].concat(paths || []));
    return out.trim().split('\n').filter(Boolean).map(function (l) {
        const [sha, author, date, ...rest] = l.split('|');
        return { sha, author, date, subject: rest.join('|') };
    });
}

async function commitFiles(sha) {
    const out = await git(['show', '--name-only', '--pretty=format:', sha]);
    return out.trim().split('\n').filter(Boolean);
}

async function fileAt(sha, file) {
    return git(['show', sha + ':' + file]);
}

/* Restore one file to its content at `sha`, as a new commit (history preserved). */
function restoreFile(sha, file, message, authorName, authorEmail) {
    return enqueue(async function () {
        await git(['checkout', sha, '--', file]);
        const status = await git(['status', '--porcelain', '--', file]);
        if (!status.trim()) return { committed: false };
        await git(['-c', 'user.name=ROOFY Admin', '-c', 'user.email=admin@roofyinvestments.com',
            'commit', '-m', message, '--author', `${authorName} <${authorEmail}>`, '--', file]);
        const newSha = (await git(['rev-parse', '--short', 'HEAD'])).trim();
        pushAsync();
        return { committed: true, sha: newSha };
    });
}

async function headInfo() {
    try {
        const sha = (await git(['rev-parse', '--short', 'HEAD'])).trim();
        const ahead = (await git(['rev-list', '--count', '@{u}..HEAD']).catch(function () { return '?'; }));
        return { sha, ahead: String(ahead).trim() };
    } catch (e) { return { sha: '?', ahead: '?' }; }
}

module.exports = { REPO, BRANCH, commitPaths, log, commitFiles, fileAt, restoreFile, headInfo, pushAsync };
