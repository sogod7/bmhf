import fs from 'node:fs';
import { productGroups } from '../lib/products.js';

const baseUrl = 'https://bmhf.co.kr';
const currentDate = new Date().toISOString().split('T')[0];

const staticKoreanRoutes = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'company.html', priority: '0.8', changefreq: 'monthly' },
  { path: 'technology.html', priority: '0.9', changefreq: 'monthly' },
  { path: 'solutions.html', priority: '0.9', changefreq: 'monthly' },
  { path: 'applications.html', priority: '0.8', changefreq: 'monthly' },
  { path: 'projects.html', priority: '0.8', changefreq: 'monthly' },
  { path: 'contact.html', priority: '0.9', changefreq: 'monthly' },
  { path: 'products', priority: '0.9', changefreq: 'weekly' },
  { path: 'videos', priority: '0.7', changefreq: 'monthly' },
  { path: 'notices', priority: '0.7', changefreq: 'weekly' },
  { path: 'resources', priority: '0.7', changefreq: 'monthly' },
  { path: 'support', priority: '0.7', changefreq: 'monthly' },
];

const urls = [];

for (const route of staticKoreanRoutes) {
  urls.push({
    loc: route.path ? `${baseUrl}/${route.path}` : `${baseUrl}/`,
    lastmod: currentDate,
    changefreq: route.changefreq,
    priority: route.priority,
  });
}

for (const group of productGroups) {
  for (const [slug] of group.items) {
    urls.push({
      loc: `${baseUrl}/products/${group.id}/${slug}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }
}

const englishRoutes = [
  '',
  'company',
  'technology',
  'solutions',
  'applications',
  'projects',
  'videos',
  'notices',
  'support',
  'board',
  'resources',
  'contact',
];

for (const path of englishRoutes) {
  urls.push({
    loc: path ? `${baseUrl}/en/${path}` : `${baseUrl}/en`,
    lastmod: currentDate,
    changefreq: path ? 'monthly' : 'weekly',
    priority: path ? '0.7' : '0.9',
  });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync('public/sitemap.xml', xml, 'utf-8');
console.log(`Generated public/sitemap.xml with ${urls.length} URLs`);
