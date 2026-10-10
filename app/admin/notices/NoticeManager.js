'use client';

import { useEffect, useMemo, useState } from 'react';
import { NOTICE_CATEGORIES } from '../../../lib/admin-constants';
import { displayDate } from '../../../lib/notices';
import { Toggle, api, useToast } from '../admin-client';

const today = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const blank = () => ({ title: '', category: '공지', notice_date: today(), body: '', pinned: false, visible: true });
const sortNotices = (items) => [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.notice_date).localeCompare(String(a.notice_date)));

function NoticeForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  return <form className="ac-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
    <label className="ac-field is-wide">제목<input className="ac-input" value={form.title} onChange={set('title')} maxLength={200} required autoFocus /></label>
    <label className="ac-field">분류<select className="ac-input" value={form.category} onChange={set('category')}>{[...new Set([...NOTICE_CATEGORIES, form.category])].map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="ac-field">등록일<input className="ac-input" type="date" value={form.notice_date} onChange={set('notice_date')} required /></label>
    <label className="ac-field is-wide">내용<textarea className="ac-input" rows={6} value={form.body} onChange={set('body')} /></label>
    <div className="ac-field is-wide ac-inline">
      <Toggle checked={form.pinned} onChange={(pinned) => setForm((value) => ({ ...value, pinned }))} label="상단 고정" />
      <Toggle checked={form.visible} onChange={(visible) => setForm((value) => ({ ...value, visible }))} label="사이트 공개" />
    </div>
    <div className="ac-form-actions"><button type="button" className="ac-btn" onClick={onCancel}>취소</button><button className="ac-btn is-primary" disabled={saving}>{saving ? '저장 중' : '저장'}</button></div>
  </form>;
}

export default function NoticeManager({ initialNotices, initialPopupIds }) {
  const [notices, setNotices] = useState(sortNotices(initialNotices));
  const [popupIds, setPopupIds] = useState(initialPopupIds);
  const [editing, setEditing] = useState(null); // notice id or 'new'
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, showToast] = useToast();
  useEffect(() => { if (new URLSearchParams(window.location.search).get('new')) setEditing('new'); }, []);

  const shown = useMemo(() => notices.filter((item) => filter === 'all' || (filter === 'visible' ? item.visible : !item.visible)), [notices, filter]);
  const put = (notice) => setNotices((items) => sortNotices(items.some((item) => item.id === notice.id) ? items.map((item) => item.id === notice.id ? notice : item) : [notice, ...items]));

  async function save(form) {
    setSaving(true);
    try {
      const { notice } = editing === 'new' ? await api('/api/admin/notices', { method: 'POST', body: form }) : await api('/api/admin/notices', { method: 'PATCH', body: { id: editing, ...form } });
      put(notice); setEditing(null); showToast(editing === 'new' ? '공지를 등록했습니다.' : '공지를 수정했습니다.');
    } catch (error) { showToast(error.message, 'error'); } finally { setSaving(false); }
  }
  async function quick(notice, changes, message) {
    try { put((await api('/api/admin/notices', { method: 'PATCH', body: { id: notice.id, ...changes } })).notice); showToast(message); } catch (error) { showToast(error.message, 'error'); }
  }
  async function togglePopup(notice, on) {
    const next = on ? [...popupIds.filter((id) => notices.some((item) => item.id === id)), notice.id] : popupIds.filter((id) => id !== notice.id);
    if (on && next.length > 5) { showToast('팝업은 최대 5건까지 띄울 수 있습니다.', 'error'); return; }
    try { setPopupIds((await api('/api/admin/settings', { method: 'PATCH', body: { key: 'popup_notices', value: next } })).settings.popup_notices || []); showToast(on ? (notice.visible ? '홈페이지 팝업으로 띄웁니다.' : '팝업으로 지정했습니다. 공개 상태여야 사이트에 뜹니다.') : '팝업을 내렸습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }
  async function remove(notice) {
    if (!window.confirm(`'${notice.title}' 공지를 삭제할까요?`)) return;
    try { await api(`/api/admin/notices?id=${encodeURIComponent(notice.id)}`, { method: 'DELETE' }); setNotices((items) => items.filter((item) => item.id !== notice.id)); showToast('공지를 삭제했습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }

  return <>
    <div className="ac-toolbar">
      <div className="ac-tabs">{[['all', '전체', notices.length], ['visible', '공개', notices.filter((item) => item.visible).length], ['hidden', '비공개', notices.filter((item) => !item.visible).length]].map(([id, label, count]) => <button key={id} type="button" className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label} <b>{count}</b></button>)}</div>
      <div className="ac-toolbar-side"><a className="ac-btn" href="/notices" target="_blank" rel="noreferrer">공지 페이지 ↗</a><button type="button" className="ac-btn is-primary" onClick={() => setEditing('new')} disabled={editing === 'new'}>새 공지</button></div>
    </div>
    {editing === 'new' && <section className="ac-card"><h2 className="ac-card-title">새 공지 작성</h2><NoticeForm initial={blank()} saving={saving} onCancel={() => setEditing(null)} onSave={save} /></section>}
    <div className="ac-stack">
      {shown.map((notice) => <article key={notice.id} className={`ac-card ac-item${notice.visible ? '' : ' is-muted'}`}>
        {editing === notice.id ? <NoticeForm initial={{ title: notice.title, category: notice.category, notice_date: String(notice.notice_date).slice(0, 10), body: notice.body || '', pinned: notice.pinned, visible: notice.visible }} saving={saving} onCancel={() => setEditing(null)} onSave={save} /> : <>
          <div className="ac-item-meta">{notice.pinned && <span className="ac-badge tone-blue">고정</span>}{popupIds.includes(notice.id) && <span className="ac-badge tone-green">팝업</span>}<span className="ac-badge tone-gray">{notice.category}</span>{!notice.visible && <span className="ac-badge tone-amber">비공개</span>}<time>{displayDate(notice.notice_date)}</time></div>
          <h3>{notice.title}</h3>
          {notice.body && <p className="ac-item-body">{notice.body}</p>}
          <div className="ac-item-actions">
            <Toggle checked={notice.pinned} onChange={(pinned) => quick(notice, { pinned }, pinned ? '상단에 고정했습니다.' : '고정을 해제했습니다.')} label="고정" />
            <Toggle checked={notice.visible} onChange={(visible) => quick(notice, { visible }, visible ? '사이트에 공개했습니다.' : '비공개로 전환했습니다.')} label="공개" />
            <Toggle checked={popupIds.includes(notice.id)} onChange={(on) => togglePopup(notice, on)} label="팝업" />
            <span className="ac-spacer" />
            <button type="button" className="ac-btn is-ghost" onClick={() => setEditing(notice.id)}>수정</button>
            <button type="button" className="ac-btn is-ghost is-danger" onClick={() => remove(notice)}>삭제</button>
          </div>
        </>}
      </article>)}
      {!shown.length && <p className="ac-card ac-empty">표시할 공지가 없습니다.</p>}
    </div>
    {toast}
  </>;
}
