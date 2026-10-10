'use client';

import { useState } from 'react';
import { RESOURCE_TYPES, formatBytes, resourceTypeLabel } from '../../../lib/admin-constants';
import { Toggle, api, uploadFile, useToast } from '../admin-client';

const ACCEPT = '.pdf,.zip,.docx,.xlsx,.pptx,.hwp,.jpg,.png';

function ResourceForm({ initial, isNew, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    if (isNew && !file) { setStatus('파일을 선택하세요.'); return; }
    try {
      let uploaded;
      if (file) { setStatus('파일 업로드 중…'); uploaded = await uploadFile('/api/admin/resources/upload', file); }
      setStatus('저장 중…');
      await onSave({ ...form, ...(uploaded ? { file: uploaded } : {}) });
    } catch (error) { setStatus(error.message); }
  }
  const busy = status.endsWith('…');
  return <form className="ac-form" onSubmit={submit}>
    <label className="ac-field">분류<select className="ac-input" value={form.type} onChange={set('type')}>{RESOURCE_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
    <div className="ac-field ac-inline"><Toggle checked={form.status === 'published'} onChange={(on) => setForm((value) => ({ ...value, status: on ? 'published' : 'draft' }))} label="자료실 공개" /></div>
    <label className="ac-field">국문 제목<input className="ac-input" value={form.title_ko} onChange={set('title_ko')} maxLength={200} required autoFocus /></label>
    <label className="ac-field">영문 제목<input className="ac-input" value={form.title_en} onChange={set('title_en')} maxLength={200} placeholder="영문 자료실에 표시" /></label>
    <label className="ac-field">국문 설명<textarea className="ac-input" rows={3} value={form.description_ko} onChange={set('description_ko')} maxLength={1000} /></label>
    <label className="ac-field">영문 설명<textarea className="ac-input" rows={3} value={form.description_en} onChange={set('description_en')} maxLength={1000} /></label>
    <label className="ac-field is-wide">{isNew ? '파일' : '파일 교체 (선택)'}<input className="ac-input ac-file" type="file" accept={ACCEPT} onChange={(event) => setFile(event.target.files?.[0] || null)} />{file && <small>{file.name} · {formatBytes(file.size)}</small>}</label>
    {status && <p className={`ac-field is-wide ${busy ? 'ac-hint' : 'ac-error'}`}>{status}</p>}
    <div className="ac-form-actions"><button type="button" className="ac-btn" onClick={onCancel} disabled={busy}>취소</button><button className="ac-btn is-primary" disabled={busy}>{busy ? '처리 중' : '저장'}</button></div>
  </form>;
}

export default function ResourceManager({ initialResources }) {
  const [resources, setResources] = useState(initialResources);
  const [editing, setEditing] = useState(null);
  const [toast, showToast] = useToast();
  const put = (resource) => setResources((items) => items.some((item) => item.id === resource.id) ? items.map((item) => item.id === resource.id ? resource : item) : [...items, resource]);

  async function save(form) {
    const { resource } = editing === 'new' ? await api('/api/admin/resources', { method: 'POST', body: form }) : await api('/api/admin/resources', { method: 'PATCH', body: { id: editing, ...form } });
    put(resource); setEditing(null); showToast(editing === 'new' ? '자료를 등록했습니다.' : '자료를 수정했습니다.');
  }
  async function togglePublished(resource, on) {
    try { put((await api('/api/admin/resources', { method: 'PATCH', body: { id: resource.id, status: on ? 'published' : 'draft' } })).resource); showToast(on ? '자료실에 공개했습니다.' : '비공개로 전환했습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }
  async function remove(resource) {
    if (!window.confirm(`'${resource.title_ko}' 자료를 삭제할까요? 업로드한 파일도 함께 삭제됩니다.`)) return;
    try { await api(`/api/admin/resources?id=${encodeURIComponent(resource.id)}`, { method: 'DELETE' }); setResources((items) => items.filter((item) => item.id !== resource.id)); showToast('자료를 삭제했습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }
  const formValues = (resource) => ({ type: resource.type, status: resource.status, title_ko: resource.title_ko || '', title_en: resource.title_en || '', description_ko: resource.description_ko || '', description_en: resource.description_en || '' });

  return <>
    <div className="ac-toolbar">
      <p className="ac-toolbar-note">공개 {resources.filter((item) => item.status === 'published').length}건 · 누적 다운로드 {resources.reduce((sum, item) => sum + (item.download_count || 0), 0).toLocaleString('ko-KR')}회</p>
      <div className="ac-toolbar-side"><a className="ac-btn" href="/resources" target="_blank" rel="noreferrer">자료실 ↗</a><button type="button" className="ac-btn is-primary" onClick={() => setEditing('new')} disabled={editing === 'new'}>자료 등록</button></div>
    </div>
    {editing === 'new' && <section className="ac-card"><h2 className="ac-card-title">새 기술자료 등록</h2><ResourceForm isNew initial={{ type: 'catalog', status: 'published', title_ko: '', title_en: '', description_ko: '', description_en: '' }} onCancel={() => setEditing(null)} onSave={save} /></section>}
    <div className="ac-stack">
      {resources.map((resource) => <article key={resource.id} className={`ac-card ac-item${resource.status === 'published' ? '' : ' is-muted'}`}>
        {editing === resource.id ? <ResourceForm initial={formValues(resource)} onCancel={() => setEditing(null)} onSave={save} /> : <>
          <div className="ac-item-meta"><span className="ac-badge tone-blue">{resourceTypeLabel(resource.type)}</span>{resource.status !== 'published' && <span className="ac-badge tone-amber">비공개</span>}<span>다운로드 {(resource.download_count || 0).toLocaleString('ko-KR')}회</span></div>
          <h3>{resource.title_ko}</h3>
          {resource.title_en && <p className="ac-item-sub">{resource.title_en}</p>}
          {resource.description_ko && <p className="ac-item-body">{resource.description_ko}</p>}
          <a className="ac-link" href={resource.file_url} target="_blank" rel="noreferrer">📄 {resource.file_name || resource.file_url}{resource.file_size ? ` · ${formatBytes(resource.file_size)}` : ''}</a>
          <div className="ac-item-actions">
            <Toggle checked={resource.status === 'published'} onChange={(on) => togglePublished(resource, on)} label="공개" />
            <span className="ac-spacer" />
            <button type="button" className="ac-btn is-ghost" onClick={() => setEditing(resource.id)}>수정</button>
            <button type="button" className="ac-btn is-ghost is-danger" onClick={() => remove(resource)}>삭제</button>
          </div>
        </>}
      </article>)}
      {!resources.length && <p className="ac-card ac-empty">등록된 기술자료가 없습니다.</p>}
    </div>
    {toast}
  </>;
}
