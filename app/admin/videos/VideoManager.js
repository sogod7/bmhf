'use client';

import { useState } from 'react';
import { youtubeId, youtubeThumbnail } from '../../../lib/admin-constants';
import { Toggle, api, useToast } from '../admin-client';

const thumbOf = (video) => video.thumbnail || youtubeThumbnail(video.video_url);

function VideoForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const preview = form.thumbnail || youtubeThumbnail(form.video_url);
  return <form className="ac-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
    <label className="ac-field is-wide">유튜브 주소<input className="ac-input" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={form.video_url} onChange={set('video_url')} required autoFocus /></label>
    {form.video_url && !youtubeId(form.video_url) && <p className="ac-field is-wide ac-error">유튜브 영상 주소 형식이 아닙니다.</p>}
    <label className="ac-field is-wide">제목<input className="ac-input" value={form.title} onChange={set('title')} maxLength={200} required /></label>
    <label className="ac-field is-wide">썸네일 주소 (선택)<input className="ac-input" placeholder="비워 두면 유튜브 썸네일 사용" value={form.thumbnail} onChange={set('thumbnail')} /></label>
    {preview && <img className="ac-field ac-thumb-preview" src={preview} alt="썸네일 미리보기" />}
    <div className="ac-field is-wide ac-inline"><Toggle checked={form.visible} onChange={(visible) => setForm((value) => ({ ...value, visible }))} label="영상자료실에 공개" /></div>
    <div className="ac-form-actions"><button type="button" className="ac-btn" onClick={onCancel}>취소</button><button className="ac-btn is-primary" disabled={saving}>{saving ? '저장 중' : '저장'}</button></div>
  </form>;
}

export default function VideoManager({ initialVideos }) {
  const [videos, setVideos] = useState(initialVideos);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const put = (video) => setVideos((items) => items.some((item) => item.id === video.id) ? items.map((item) => item.id === video.id ? video : item) : [...items, video]);

  async function save(form) {
    setSaving(true);
    try {
      const { video } = editing === 'new' ? await api('/api/admin/videos', { method: 'POST', body: form }) : await api('/api/admin/videos', { method: 'PATCH', body: { id: editing, ...form } });
      put(video); setEditing(null); showToast(editing === 'new' ? '영상을 등록했습니다.' : '영상을 수정했습니다.');
    } catch (error) { showToast(error.message, 'error'); } finally { setSaving(false); }
  }
  async function toggleVisible(video, visible) {
    try { put((await api('/api/admin/videos', { method: 'PATCH', body: { id: video.id, visible } })).video); showToast(visible ? '영상을 공개했습니다.' : '영상을 숨겼습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }
  async function move(index, offset) {
    const next = [...videos]; const [item] = next.splice(index, 1); next.splice(index + offset, 0, item);
    setVideos(next);
    try { setVideos((await api('/api/admin/videos', { method: 'PATCH', body: { order: next.map((video) => video.id) } })).videos); } catch (error) { setVideos(videos); showToast(error.message, 'error'); }
  }
  async function remove(video) {
    if (!window.confirm(`'${video.title}' 영상을 삭제할까요?`)) return;
    try { await api(`/api/admin/videos?id=${encodeURIComponent(video.id)}`, { method: 'DELETE' }); setVideos((items) => items.filter((item) => item.id !== video.id)); showToast('영상을 삭제했습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }

  return <>
    <div className="ac-toolbar">
      <p className="ac-toolbar-note">공개 {videos.filter((video) => video.visible).length}건 · 전체 {videos.length}건 · 위에서부터 순서대로 노출됩니다.</p>
      <div className="ac-toolbar-side"><a className="ac-btn" href="/videos" target="_blank" rel="noreferrer">영상자료실 ↗</a><button type="button" className="ac-btn is-primary" onClick={() => setEditing('new')} disabled={editing === 'new'}>영상 추가</button></div>
    </div>
    {editing === 'new' && <section className="ac-card"><h2 className="ac-card-title">새 영상 등록</h2><VideoForm initial={{ title: '', video_url: '', thumbnail: '', visible: true }} saving={saving} onCancel={() => setEditing(null)} onSave={save} /></section>}
    <div className="ac-stack">
      {videos.map((video, index) => <article key={video.id} className={`ac-card ac-media${video.visible ? '' : ' is-muted'}`}>
        {editing === video.id ? <VideoForm initial={{ title: video.title, video_url: video.video_url, thumbnail: video.thumbnail || '', visible: video.visible }} saving={saving} onCancel={() => setEditing(null)} onSave={save} /> : <>
          <a className="ac-media-thumb" href={video.video_url} target="_blank" rel="noreferrer">{thumbOf(video) ? <img src={thumbOf(video)} alt="" /> : <span>미리보기 없음</span>}<i>▶</i></a>
          <div className="ac-media-body">
            <div className="ac-item-meta"><span className="ac-badge tone-gray">#{index + 1}</span>{!video.visible && <span className="ac-badge tone-amber">비공개</span>}</div>
            <h3>{video.title}</h3>
            <a className="ac-link" href={video.video_url} target="_blank" rel="noreferrer">{video.video_url}</a>
            <div className="ac-item-actions">
              <Toggle checked={video.visible} onChange={(visible) => toggleVisible(video, visible)} label="공개" />
              <span className="ac-spacer" />
              <button type="button" className="ac-btn is-ghost is-icon" onClick={() => move(index, -1)} disabled={index === 0} aria-label="위로">↑</button>
              <button type="button" className="ac-btn is-ghost is-icon" onClick={() => move(index, 1)} disabled={index === videos.length - 1} aria-label="아래로">↓</button>
              <button type="button" className="ac-btn is-ghost" onClick={() => setEditing(video.id)}>수정</button>
              <button type="button" className="ac-btn is-ghost is-danger" onClick={() => remove(video)}>삭제</button>
            </div>
          </div>
        </>}
      </article>)}
      {!videos.length && <p className="ac-card ac-empty">등록된 영상이 없습니다.</p>}
    </div>
    {toast}
  </>;
}
