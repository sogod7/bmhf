'use client';

import { useEffect, useState } from 'react';

const key = 'bmhf-video-draft';

export default function VideoManager({ initialVideos }) {
  const [videos, setVideos] = useState(initialVideos); const [saved, setSaved] = useState(false);
  useEffect(() => { const draft = localStorage.getItem(key); if (draft) setVideos(JSON.parse(draft)); }, []);
  function update(id, changes) { setVideos((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item)); setSaved(false); }
  function save() { localStorage.setItem(key, JSON.stringify(videos)); setSaved(true); }
  return <main className="admin video-admin"><aside><strong>BMHF ADMIN</strong><a href="/admin">운영 현황</a><a className="active" href="/admin/videos">영상 관리</a><a href="/index.html">사이트 보기</a></aside><section><div className="admin-head"><div><p className="kicker dark">VIDEO LIBRARY</p><h1>영상 관리</h1><p>기존 BMHF 영상 5건을 이관했습니다.</p></div><button onClick={save}>변경 사항 저장</button></div><p className="video-admin-notice">현재는 브라우저 임시 저장입니다. Supabase 연결 후 전체 사이트에 즉시 반영됩니다.</p><div className="video-admin-list">{videos.map((video) => <article key={video.id}><img src={video.thumbnail} alt="" /><div><label>제품명<input value={video.title} onChange={(event) => update(video.id, { title: event.target.value })} /></label><label>영상 링크<input value={video.videoUrl} onChange={(event) => update(video.id, { videoUrl: event.target.value })} /></label><label>썸네일 URL<input value={video.thumbnail} onChange={(event) => update(video.id, { thumbnail: event.target.value })} /></label><p><button className={video.visible ? 'visible' : 'hidden'} onClick={() => update(video.id, { visible: !video.visible })}>{video.visible ? '사이트 노출 중' : '사이트 비노출'}</button></p></div></article>)}</div>{saved && <p className="video-saved">임시 저장했습니다.</p>}</section></main>;
}
