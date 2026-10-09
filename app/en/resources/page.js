import Link from 'next/link';
import { connection } from 'next/server';
import { formatBytes, resourceTypeLabel } from '../../../lib/admin-constants';
import { listPublicResources } from '../../../lib/resources';

export const metadata = {
  title: 'Technical Resources & Catalogues | BMHF Induction Systems',
  description: 'Download official catalogues, specification sheets, and company profiles for BMHF induction systems.',
  alternates: { canonical: '/en/resources' },
};

const fileLabel = (doc) => `${(doc.file_name || doc.file_url).split('.').pop().toUpperCase()} Document${doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ''}`;

export default async function EnglishResources() {
  await connection();
  const documents = await listPublicResources().catch(() => []);
  return (
    <main>
      <header className="nav">
        <Link href="/en" className="brand">BMHF</Link>
        <nav>
          <a href="/index.html">한국어</a>
          <Link href="/en">Home</Link>
          <Link href="/en/board">News</Link>
          <Link className="nav-cta" href="/en/contact">Request a quote</Link>
        </nav>
      </header>

      <section className="page-head">
        <p className="kicker dark">TECHNICAL RESOURCES</p>
        <h1>Catalogues and technical documents.</h1>
        <p>Download technical documentation, product catalogues, and specifications for BMHF induction systems.</p>
      </section>

      <section className="section" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {resourceTypeLabel(doc.type, 'en')}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '8px 0 10px', color: '#1e293b' }}>
                  {doc.title_en || doc.title_ko}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', margin: '0 0 20px' }}>
                  {doc.description_en || doc.description_ko}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>{fileLabel(doc)}</span>
                <a
                  href={`/api/resources/${doc.id}/download`}
                  className="button"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Download ↓
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', padding: '24px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <p style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Need specific drawings or custom coil design calculations?</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Our technical engineering team is ready to evaluate your workpiece and production specifications.</p>
          <Link href="/en/contact" className="button" style={{ display: 'inline-block' }}>Contact Engineering Team</Link>
        </div>
      </section>
    </main>
  );
}
