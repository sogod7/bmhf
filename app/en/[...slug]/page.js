import Link from 'next/link';
import { englishPages } from '../../../lib/i18n';
import '../../site.css';

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const key = slug.join('/') || 'company';
  const page = englishPages[key];
  const pageTitle = page ? `${page.title} | BMHF` : 'BMHF | Induction System Engineering';
  const pageDesc = page ? page.body : 'Baek-Ma High Frequency designs precision induction systems.';

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `/en/${key}`,
      languages: {
        'en-US': `/en/${key}`,
        'ko-KR': `/${key}.html`,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `/en/${key}`,
    },
  };
}

export default async function EnglishFallbackPage({ params }) {
  const { slug = [] } = await params;
  const key = slug.join('/') || 'company';
  const page = englishPages[key] || {
    eyebrow: 'BMHF',
    title: 'BMHF Induction System Engineering',
    body: 'Baek-Ma High Frequency provides dedicated induction systems for high-volume manufacturing lines.',
    sections: [],
  };

  return (
    <main>
      <header className="nav">
        <Link href="/en" className="brand">BMHF</Link>
        <nav>
          <a href={`/${key}.html`}>한국어</a>
          <Link href="/en">Home</Link>
          <Link href="/en/resources">Resources</Link>
          <Link href="/en/board">News</Link>
          <Link className="nav-cta" href="/en/contact">Request a quote</Link>
        </nav>
      </header>

      <section className="page-head">
        <p className="kicker dark">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p style={{ maxWidth: '780px', margin: '0 auto 24px', lineHeight: '1.6' }}>{page.body}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="button" href="/en/contact">Discuss your project</Link>
          <Link className="button" style={{ background: '#f1f5f9', color: '#1e293b' }} href="/en/resources">Download Catalogues ↓</Link>
        </div>
      </section>

      {page.sections && page.sections.length > 0 && (
        <section className="section" style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {page.sections.map((sec, idx) => (
              <article
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                  {sec.heading}
                </h2>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: sec.points?.length ? '18px' : '0' }}>
                  {sec.text}
                </p>
                {sec.points && sec.points.length > 0 && (
                  <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sec.points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.5' }}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <div style={{ marginTop: '48px', padding: '36px', background: '#0b1329', color: '#ffffff', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              GLOBAL ENGINEERING COOPERATION
            </p>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
              Ready to verify cycle times for your workpiece?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '640px', margin: '0 auto 24px' }}>
              Send us your workpiece CAD drawings and target production volume. Our team will prepare a technical review and preliminary system layout.
            </p>
            <Link className="button" href="/en/contact" style={{ display: 'inline-block' }}>
              Contact BMHF Engineering
            </Link>
          </div>
        </section>
      )}

      <footer className="footer" style={{ borderTop: '1px solid #e2e8f0', padding: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        © BEAK-MA HIGH FREQUENCY (BMHF) · Tel: +82-31-498-1292 · <a href="mailto:master@bmhf.co.kr" style={{ color: '#0056b3' }}>master@bmhf.co.kr</a>
      </footer>
    </main>
  );
}
