import Link from 'next/link';
import { englishPages } from '../../../lib/i18n';
import '../../site.css';

export default async function EnglishFallbackPage({ params }) {
  const { slug = [] } = await params;
  const key = slug.join('/') || 'company';
  const page = englishPages[key] || { eyebrow: 'BMHF', title: 'BMHF induction systems.', body: 'This English page is being prepared. Please contact BMHF for technical information.' };
  return <main><section className="page-head"><p className="kicker dark">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.body}</p><Link className="button" href="/en/contact">Request a consultation</Link></section></main>;
}
