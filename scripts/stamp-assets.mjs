// Adds a content hash to the static pages' CSS/JS URLs (style.css?v=…, main.js?v=…).
// /assets is served with a 7-day browser cache (vercel.json), so without this, returning
// visitors keep running stale CSS/JS against new HTML. Runs in prebuild; commit the result.
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const assets = ['assets/css/style.css', 'assets/js/main.js'];
const pages = ['index', 'company', 'technology', 'solutions', 'applications', 'projects', 'contact'];

const version = (file) => createHash('sha256').update(fs.readFileSync(`public/${file}`)).digest('hex').slice(0, 10);
const stamps = assets.map((file) => [file, version(file)]);

let changed = 0;
for (const page of pages) for (const html of [`public/${page}.html`, `${page}.html`]) {
  if (!fs.existsSync(html)) continue;
  const before = fs.readFileSync(html, 'utf8');
  let after = before;
  for (const [file, hash] of stamps) {
    // Matches "assets/js/main.js" or "assets/js/main.js?v=old" inside an attribute value.
    after = after.split('"').map((part) => (part === file || part.startsWith(`${file}?v=`) ? `${file}?v=${hash}` : part)).join('"');
  }
  if (after !== before) { fs.writeFileSync(html, after); changed += 1; }
}
console.log(`Stamped asset versions (${stamps.map(([file, hash]) => `${file.split('/').pop()}=${hash}`).join(', ')}) in ${changed} page(s).`);
