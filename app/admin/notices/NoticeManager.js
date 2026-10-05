'use client';

import { useEffect, useState } from 'react';
import { noticeStorageKey } from '../../../lib/notices';

export default function NoticeManager({ initialNotices }) {
  const [notices, setNotices] = useState(initialNotices); const [saved, setSaved] = useState(false);
  useEffect(() => { try { const draft = localStorage.getItem(noticeStorageKey); if (draft) setNotices(JSON.parse(draft)); } catch {} }, []);
  const update = (id, changes) => { setNotices((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item)); setSaved(false); };
  const add = () => { const id = `notice-${Date.now()}`; setNotices((items) => [{ id, title: '새 공지사항', date: new Date().toISOString().slice(0, 10).replaceAll('-', '.'), category: '공지', pinned: false, visible: true, body: '공지 내용을 입력하세요.' }, ...items]); setSaved(false); };
  const save = () => { localStorage.setItem(noticeStorageKey, JSON.stringify(notices)); setSaved(true); };
  return <main className="admin notice-admin"><aside><strong>BMHF ADMIN</strong><a href="/admin">운영 현황</a><a href="/admin/videos">영상 관리</a><a className="active" href="/admin/notices">공지사항 관리</a><a href="/index.html">사이트 보기</a></aside><section><div className="admin-head"><div><p className="kicker dark">NOTICE MANAGEMENT</p><h1>공지사항 관리</h1><p>고정된 공지는 홈페이지와 공지 목록의 최상단에 노출됩니다.</p></div><div className="notice-actions"><button onClick={add}>공지 추가</button><button className="save" onClick={save}>변경 사항 저장</button></div></div><p className="notice-admin-note">현재는 브라우저 임시 저장 방식입니다. Supabase 연결 후 모든 방문자에게 즉시 반영됩니다.</p><div className="notice-admin-list">{notices.map((notice) => <article key={notice.id}><div className="notice-switches"><button className={notice.pinned ? 'on' : ''} onClick={() => update(notice.id, { pinned: !notice.pinned })}>{notice.pinned ? '앞단 고정 중' : '앞단 고정 안 함'}</button><button className={notice.visible ? 'on' : ''} onClick={() => update(notice.id, { visible: !notice.visible })}>{notice.visible ? '공개' : '비공개'}</button></div><label>제목<input value={notice.title} onChange={(event) => update(notice.id, { title: event.target.value })} /></label><div className="notice-fields"><label>분류<input value={notice.category} onChange={(event) => update(notice.id, { category: event.target.value })} /></label><label>등록일<input value={notice.date} onChange={(event) => update(notice.id, { date: event.target.value })} /></label></div><label>내용<textarea value={notice.body} onChange={(event) => update(notice.id, { body: event.target.value })} /></label></article>)}</div>{saved && <p className="notice-saved">저장했습니다.</p>}</section></main>;
}
