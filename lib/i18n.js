export const navigation = {
  ko: [['회사소개', '/company.html'], ['보유기술', '/technology.html'], ['제품소개', '/products'], ['적용분야', '/applications.html'], ['영상자료', '/videos'], ['공지사항', '/notices'], ['문의', '/contact.html']],
  en: [['Company', '/en/company'], ['Technology', '/en/technology'], ['Products', '/en/products'], ['Applications', '/en/applications'], ['Videos', '/en/videos'], ['News', '/en/notices'], ['Contact', '/en/contact']],
};

const staticRoutes = { company: '/company.html', technology: '/technology.html', solutions: '/solutions.html', applications: '/applications.html', projects: '/projects.html', contact: '/contact.html' };

export function englishPath(pathname = '/') {
  if (pathname === '/' || pathname === '/index.html' || pathname === '/en') return '/en';
  if (pathname.startsWith('/en/')) return pathname;
  if (pathname.startsWith('/products')) return `/en${pathname}`;
  const key = Object.entries(staticRoutes).find(([, value]) => value === pathname)?.[0];
  return key ? `/en/${key}` : `/en${pathname}`;
}

export function koreanPath(pathname = '/') {
  if (!pathname.startsWith('/en')) return pathname;
  const slug = pathname.replace(/^\/en\/?/, '');
  if (!slug) return '/index.html';
  if (slug.startsWith('products')) return `/${slug}`;
  return staticRoutes[slug] || `/${slug}`;
}

export const englishPages = {
  company: { eyebrow: 'ABOUT BMHF', title: 'Induction engineering built for production.', body: 'Baek-Ma High Frequency designs and integrates induction equipment around real workpieces, quality targets and production conditions.' },
  technology: { eyebrow: 'CORE TECHNOLOGY', title: 'Technology that connects power, coil and process.', body: 'Our engineering team verifies electrical power, coil geometry, cooling, fixtures and automation as one process system.' },
  solutions: { eyebrow: 'SYSTEM SOLUTIONS', title: 'A complete induction solution for each process.', body: 'From feasibility review to system integration, BMHF helps turn process requirements into reliable production equipment.' },
  applications: { eyebrow: 'APPLICATIONS', title: 'Built for the parts and industries that matter.', body: 'We support heat treatment, brazing and induction heating applications across automotive, machinery and component manufacturing.' },
  projects: { eyebrow: 'PROJECTS', title: 'Production systems shaped by field experience.', body: 'Explore examples of BMHF engineering approaches for repeatable quality and scalable output.' },
  videos: { eyebrow: 'VIDEO LIBRARY', title: 'See BMHF systems in operation.', body: 'Review product and process videos, then contact us to discuss the conditions of your own production line.' },
  notices: { eyebrow: 'NEWSROOM', title: 'Latest notices from BMHF.', body: 'Product, company and service updates are published here. Korean notices remain the official source where translations are pending.' },
  support: { eyebrow: 'AI CUSTOMER CARE', title: 'Start your process consultation.', body: 'Tell us about your workpiece, material, process target and output requirements to begin a technical review.' },
};
