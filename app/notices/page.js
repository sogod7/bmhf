import { connection } from 'next/server';
import { displayDate, initialNotices, orderedNotices } from '../../lib/notices';
import { listPublicNotices } from '../../lib/notices-server';
import OpenFromHash from './OpenFromHash';
import './notices.css';

export default async function NoticesPage() {
  await connection();
  const notices = await listPublicNotices().catch(() => orderedNotices(initialNotices));
  return (
    <main className="notices-page">
      <header className="notices-hero">
        <p>BMHF NEWSROOM</p>
        <h1>공지사항</h1>
        <span>백마고주파의 주요 안내와 기술 업데이트를 확인하세요.</span>
      </header>
      <section className="notices-list">
        {notices.map((notice) => (
          <details key={notice.id || notice.title} id={notice.id ? `notice-${notice.id}` : undefined} className="notice-item">
            <summary>
              <span className="notice-meta">
                {notice.pinned && <b>고정</b>}
                <span>{notice.category}</span>
                <time dateTime={String(notice.notice_date).slice(0, 10)}>{displayDate(notice.notice_date)}</time>
              </span>
              <span className="notice-title">{notice.title}</span>
              <i className="notice-chevron" aria-hidden="true" />
            </summary>
            <div className="notice-body">{notice.body || '내용이 없습니다.'}</div>
          </details>
        ))}
        {!notices.length && <p className="notices-empty">등록된 공지사항이 없습니다.</p>}
      </section>
      <OpenFromHash />
    </main>
  );
}
