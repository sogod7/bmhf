import { existsSync } from 'node:fs';

const required = ['company', 'technology', 'solutions', 'applications', 'projects', 'videos', 'notices', 'support'];
const missing = required.filter((slug) => !existsSync(`app/en/${slug}/page.js`) && !existsSync('app/en/[...slug]/page.js'));
if (missing.length) {
  console.error(`Missing English route coverage: ${missing.join(', ')}`);
  process.exit(1);
}
