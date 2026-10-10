import Link from 'next/link';
import { connection } from 'next/server';
import { displayDate } from '../../../lib/notices';
import { listPublicNotices } from '../../../lib/notices-server';
import OpenFromHash from '../../notices/OpenFromHash';
import '../../notices/notices.css';

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
      <section className="notices-list" style={{ paddingTop: 0 }}>
        {notices.map((notice) => (
          <details key={notice.id} id={`notice-${notice.id}`} className="notice-item">
            <summary>
              <span className="notice-meta">
                {notice.pinned && <b>Pinned</b>}
                <span>{notice.category}</span>
                <time dateTime={String(notice.notice_date).slice(0, 10)}>{displayDate(notice.notice_date)}</time>
              </span>
              <span className="notice-title">{notice.title}</span>
              <i className="notice-chevron" aria-hidden="true" />
            </summary>
            <div className="notice-body">{notice.body || '—'}</div>
          </details>
        ))}
        {!notices.length && <p className="notices-empty">No notices have been published yet.</p>}
      </section>
      <OpenFromHash />
    </main>
  );
}
