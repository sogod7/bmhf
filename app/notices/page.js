'use client';

import { useEffect, useState } from 'react';
import { initialNotices, noticeStorageKey, orderedNotices } from '../../lib/notices';
import './notices.css';

export default function NoticesPage() {
  const [notices, setNotices] = useState(initialNotices);
  useEffect(() => { try { const saved = localStorage.getItem(noticeStorageKey); if (saved) setNotices(JSON.parse(saved)); } catch {} }, []);
  return <main className="notices-page"><header className="notices-hero"><p>BMHF NEWSROOM</p><h1>공지사항</h1><span>백마고주파의 주요 안내와 업데이트를 확인하세요.</span></header><section className="notices-list">{orderedNotices(notices).map((notice) => <article key={notice.id}><div className="notice-meta">{notice.pinned && <b>고정</b>}<span>{notice.category}</span><time>{notice.date}</time></div><h2>{notice.title}</h2><p>{notice.body}</p></article>)}</section></main>;
}
