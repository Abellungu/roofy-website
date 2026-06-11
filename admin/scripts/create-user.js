/* Create or reset an admin user:
 *   node scripts/create-user.js <username> [display name]
 * Prints a generated strong password once. */
const crypto = require('crypto');
const auth = require('../lib/auth');

const [, , username, ...nameParts] = process.argv;
if (!username || !/^[a-z0-9_-]{2,24}$/.test(username)) {
    console.error('usage: node scripts/create-user.js <username (a-z0-9_-)> [display name]');
    process.exit(1);
}
const display = nameParts.join(' ') || username;
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
let password = '';
for (const b of crypto.randomBytes(16)) password += alphabet[b % alphabet.length];

auth.upsertUser(username, password, display);
console.log('user    :', username);
console.log('name    :', display);
console.log('password:', password);
console.log('\n^ store this somewhere safe — it is not shown again.');
