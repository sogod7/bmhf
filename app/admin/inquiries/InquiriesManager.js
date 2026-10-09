'use client';

import { useEffect, useMemo, useState } from 'react';
import { INQUIRY_STATUSES, formatBytes, formatDateTime, inquiryStatusLabel } from '../../../lib/admin-constants';
import { api, useToast } from '../admin-client';

const toneOf = (status) => INQUIRY_STATUSES.find((item) => item.id === status)?.tone || 'gray';

export default function InquiriesManager({ initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, showToast] = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status')) setFilter(params.get('status'));
    if (params.get('id')) setSelectedId(params.get('id'));
  }, []);

  const selected = inquiries.find((item) => item.id === selectedId) || null;
  useEffect(() => { setMemo(selected?.admin_memo || ''); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => Object.fromEntries(INQUIRY_STATUSES.map((status) => [status.id, inquiries.filter((item) => item.status === status.id).length])), [inquiries]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inquiries.filter((item) => (filter === 'all' || item.status === filter) && (!needle || [item.company_name, item.contact_name, item.phone, item.email, item.category, item.message, item.product_title].some((value) => String(value || '').toLowerCase().includes(needle))));
  }, [inquiries, filter, query]);

  const replace = (inquiry) => setInquiries((items) => items.map((item) => item.id === inquiry.id ? inquiry : item));

  async function refresh() {
    setBusy(true);
    try { setInquiries((await api('/api/admin/inquiries')).inquiries); showToast('최신 목록을 불러왔습니다.'); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(false); }
  }
  async function changeStatus(status) {
    if (!selected || selected.status === status) return;
    try { replace((await api('/api/admin/inquiries', { method: 'PATCH', body: { id: selected.id, status } })).inquiry); showToast(`상태를 '${inquiryStatusLabel(status)}'(으)로 변경했습니다.`); } catch (error) { showToast(error.message, 'error'); }
  }
  async function saveMemo() {
    setBusy(true);
    try { replace((await api('/api/admin/inquiries', { method: 'PATCH', body: { id: selected.id, adminMemo: memo } })).inquiry); showToast('메모를 저장했습니다.'); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(false); }
  }
  async function removeSelected() {
    if (!window.confirm(`${selected.company_name} 문의를 삭제할까요? 첨부파일도 함께 삭제되며 되돌릴 수 없습니다.`)) return;
    try { await api(`/api/admin/inquiries?id=${encodeURIComponent(selected.id)}`, { method: 'DELETE' }); setInquiries((items) => items.filter((item) => item.id !== selected.id)); setSelectedId(null); showToast('문의를 삭제했습니다.'); } catch (error) { showToast(error.message, 'error'); }
  }

  return <>
    <div className="ac-toolbar">
      <div className="ac-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>전체 <b>{inquiries.length}</b></button>
        {INQUIRY_STATUSES.map((status) => <button key={status.id} type="button" role="tab" aria-selected={filter === status.id} className={filter === status.id ? 'is-active' : ''} onClick={() => setFilter(status.id)}>{status.label} <b>{counts[status.id]}</b></button>)}
      </div>
      <div className="ac-toolbar-side">
        <input className="ac-search" type="search" placeholder="회사명, 담당자, 연락처, 내용 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="button" className="ac-btn" onClick={refresh} disabled={busy}>새로고침</button>
        <a className="ac-btn" href={`/api/admin/inquiries/export?status=${filter}`}>CSV</a>
      </div>
    </div>

    <div className={`ac-split${selected ? ' has-detail' : ''}`}>
      <section className="ac-card ac-table-card">
        {filtered.length ? <ul className="ac-inquiry-list">{filtered.map((item) => <li key={item.id}>
          <button type="button" className={item.id === selectedId ? 'is-selected' : ''} onClick={() => setSelectedId(item.id)}>
            <span className="ac-inquiry-top"><strong>{item.company_name}</strong><span className={`ac-badge tone-${toneOf(item.status)}`}>{inquiryStatusLabel(item.status)}</span></span>
            <span className="ac-inquiry-meta">{item.contact_name} · {item.category}{item.files?.length ? ` · 첨부 ${item.files.length}` : ''}</span>
            {item.product_title && <span className="ac-inquiry-product">{item.product_title}</span>}
            <time>{formatDateTime(item.created_at)}</time>
          </button>
        </li>)}</ul> : <p className="ac-empty">{inquiries.length ? '조건에 맞는 문의가 없습니다.' : '아직 접수된 문의가 없습니다.'}</p>}
      </section>

      {selected && <section className="ac-card ac-detail" aria-label="문의 상세">
        <div className="ac-detail-head">
          <button type="button" className="ac-back" onClick={() => setSelectedId(null)}>← 목록</button>
          <div><p className="ac-kicker">{formatDateTime(selected.created_at)} 접수</p><h2>{selected.company_name}</h2></div>
        </div>
        <div className="ac-segment" role="group" aria-label="처리 상태">{INQUIRY_STATUSES.map((status) => <button key={status.id} type="button" className={selected.status === status.id ? `is-active tone-${status.tone}` : ''} onClick={() => changeStatus(status.id)}>{status.label}</button>)}</div>
        <dl className="ac-dl">
          <div><dt>담당자</dt><dd>{selected.contact_name}</dd></div>
          <div><dt>연락처</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div>
          <div><dt>이메일</dt><dd>{selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : '-'}</dd></div>
          <div><dt>문의 분야</dt><dd>{selected.category}</dd></div>
          {selected.product_title && <div><dt>문의 제품</dt><dd>{selected.product_title}</dd></div>}
        </dl>
        <h3>문의 내용</h3>
        <p className="ac-message">{selected.message || '(내용 없음)'}</p>
        {selected.files?.length > 0 && <><h3>첨부파일</h3><ul className="ac-files">{selected.files.map((file) => <li key={file.path}><a href={`/api/admin/inquiries/file?id=${encodeURIComponent(selected.id)}&path=${encodeURIComponent(file.path)}`} target="_blank" rel="noreferrer">{file.name}</a><span>{formatBytes(file.size)}</span></li>)}</ul></>}
        <h3>관리자 메모</h3>
        <textarea className="ac-input" rows={4} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="상담 내용, 담당 엔지니어, 후속 일정 등을 기록하세요." />
        <div className="ac-detail-actions">
          <button type="button" className="ac-btn is-danger" onClick={removeSelected}>삭제</button>
          <button type="button" className="ac-btn is-primary" onClick={saveMemo} disabled={busy || memo === (selected.admin_memo || '')}>메모 저장</button>
        </div>
      </section>}
    </div>
    {toast}
  </>;
}
