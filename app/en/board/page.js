import Link from 'next/link';
import { connection } from 'next/server';
import { displayDate } from '../../../lib/notices';
import { listPublicNotices } from '../../../lib/notices-server';

export const metadata = {
  title: 'News & Notices | BMHF Induction Systems',
  description: 'Latest news, product updates and announcements from Baek-Ma High Frequency.',
  alternates: { canonical: '/en/board' },
};

export default async function EnglishBoard() {
  await connection();
  const notices = await listPublicNotices().catch(() => []);
  return (
    <main>
      <header className="nav"><Link href="/en" className="brand">BMHF</Link><nav><a href="/notices">한국어</a><Link href="/en">Home</Link><Link href="/en/resources">Resources</Link></nav></header>
      <section className="page-head"><p className="kicker dark">NEWS</p><h1>News and notices.</h1><p>Announcements and technical updates from BMHF (published in Korean).</p></section>
      <section className="section" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 60px', display: 'grid', gap: '14px' }}>
        {notices.map((notice) => (
          <article key={notice.id} id={`notice-${notice.id}`} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>{notice.pinned ? 'Pinned · ' : ''}{notice.category} · {displayDate(notice.notice_date)}</p>
            <h2 style={{ fontSize: '19px', fontWeight: '700', margin: '8px 0', color: '#1e293b' }}>{notice.title}</h2>
            {notice.body && <p style={{ margin: 0, fontSize: '14.5px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{notice.body}</p>}
          </article>
        ))}
        {!notices.length && <p style={{ textAlign: 'center', color: '#64748b' }}>No notices have been published yet.</p>}
      </section>
    </main>
  );
}
