import { productGroups } from '../lib/products';

export default function sitemap() {
  const baseUrl = 'https://bmhf.co.kr';
  const currentDate = new Date().toISOString();

  // Core Korean Pages
  const staticKoreanRoutes = [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/company.html`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/technology.html`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${baseUrl}/solutions.html`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${baseUrl}/applications.html`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/projects.html`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/contact.html`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${baseUrl}/videos`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/notices`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/support`, priority: 0.7, changeFrequency: 'monthly' },
  ].map((item) => ({
    ...item,
    lastModified: currentDate,
  }));

  // Dynamic Product Pages
  const productRoutes = [];
  for (const group of productGroups) {
    for (const [slug] of group.items) {
      productRoutes.push({
        url: `${baseUrl}/products/${group.id}/${slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.85,
      });
    }
  }

  // English Pages
  const englishSubpages = [
    '',
    '/company',
    '/technology',
    '/solutions',
    '/applications',
    '/projects',
    '/videos',
    '/notices',
    '/support',
    '/board',
    '/resources',
    '/contact',
  ];

  const englishRoutes = englishSubpages.map((path) => ({
    url: `${baseUrl}/en${path}`,
    lastModified: currentDate,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 0.9 : 0.75,
  }));

  return [...staticKoreanRoutes, ...productRoutes, ...englishRoutes];
}
