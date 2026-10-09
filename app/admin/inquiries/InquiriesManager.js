'use client';

import { useEffect, useMemo, useState } from 'react';
import { INQUIRY_STATUSES, formatBytes, formatDateTime, inquiryStatusLabel } from '../../../lib/admin-constants';
import { api, useToast } from '../admin-client';

const PAGE_SIZE = 30;
const PERIODS = [['all', '전체 기간', 0], ['today', '오늘', 0], ['7d', '최근 7일', 7], ['30d', '최근 30일', 30]];
const toneOf = (status) => INQUIRY_STATUSES.find((item) => item.id === status)?.tone || 'gray';
const kstDay = (value) => new Date(new Date(value).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);

function inPeriod(createdAt, period) {
  if (period === 'all') return true;
  if (period === 'today') return kstDay(createdAt) === kstDay(Date.now());
  const days = PERIODS.find(([id]) => id === period)?.[2] || 0;
  return Date.now() - new Date(createdAt).getTime() < days * 86400 * 1000;
}

function replyMailto(inquiry) {
  const subject = `[백마고주파] ${inquiry.company_name} 견적·기술상담 문의 회신`;
  const quoted = String(inquiry.message || '').slice(0, 1200);
  const body = `${inquiry.contact_name}님, 안녕하세요.\n(주)백마고주파입니다.\n\n문의하신 내용에 대해 회신드립니다.\n\n\n\n---\n백마고주파 | 031-498-1292 | master@bmhf.co.kr\n\n[접수하신 문의 내용]\n${quoted}`;
  return `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function InquiriesManager({ initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [checked, setChecked] = useState(() => new Set());
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
  useEffect(() => { setLimit(PAGE_SIZE); setChecked(new Set()); }, [filter, period, query]);

  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inquiries.filter((item) => inPeriod(item.created_at, period) && (!needle || [item.company_name, item.contact_name, item.phone, item.email, item.category, item.message, item.product_title, item.admin_memo].some((value) => String(value || '').toLowerCase().includes(needle))));
  }, [inquiries, period, query]);
  const counts = useMemo(() => Object.fromEntries(INQUIRY_STATUSES.map((status) => [status.id, scoped.filter((item) => item.status === status.id).length])), [scoped]);
  const filtered = useMemo(() => scoped.filter((item) => filter === 'all' || item.status === filter), [scoped, filter]);
  const visible = filtered.slice(0, limit);
  const allVisibleChecked = visible.length > 0 && visible.every((item) => checked.has(item.id));

  const replace = (inquiry) => setInquiries((items) => items.map((item) => item.id === inquiry.id ? inquiry : item));
  const toggleChecked = (id) => setChecked((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAll = () => setChecked(allVisibleChecked ? new Set() : new Set(visible.map((item) => item.id)));

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
  async function bulkStatus(status) {
    if (!status || !checked.size) return;
    setBusy(true);
    try {
      const { inquiries: updated } = await api('/api/admin/inquiries', { method: 'PATCH', body: { ids: [...checked], status } });
      updated.forEach(replace); setChecked(new Set());
      showToast(`${updated.length}건을 '${inquiryStatusLabel(status)}'(으)로 변경했습니다.`);
    } catch (error) { showToast(error.message, 'error'); } finally { setBusy(false); }
  }
  async function bulkDelete() {
    if (!checked.size || !window.confirm(`선택한 문의 ${checked.size}건을 삭제할까요? 첨부파일도 함께 삭제되며 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    try {
      const { deleted } = await api(`/api/admin/inquiries?ids=${[...checked].map(encodeURIComponent).join(',')}`, { method: 'DELETE' });
      setInquiries((items) => items.filter((item) => !deleted.includes(item.id)));
      if (deleted.includes(selectedId)) setSelectedId(null);
      setChecked(new Set()); showToast(`문의 ${deleted.length}건을 삭제했습니다.`);
    } catch (error) { showToast(error.message, 'error'); } finally { setBusy(false); }
  }

  return <>
    <div className="ac-toolbar">
      <div className="ac-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>전체 <b>{scoped.length}</b></button>
        {INQUIRY_STATUSES.map((status) => <button key={status.id} type="button" role="tab" aria-selected={filter === status.id} className={filter === status.id ? 'is-active' : ''} onClick={() => setFilter(status.id)}>{status.label} <b>{counts[status.id]}</b></button>)}
      </div>
      <div className="ac-toolbar-side">
        <input className="ac-search" type="search" placeholder="회사명, 담당자, 연락처, 내용, 메모 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="ac-btn ac-select" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="접수 기간">{PERIODS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
        <button type="button" className="ac-btn" onClick={refresh} disabled={busy}>새로고침</button>
        <a className="ac-btn" href={`/api/admin/inquiries/export?status=${filter}`}>CSV</a>
      </div>
    </div>

    {checked.size > 0 && <div className="ac-bulkbar" role="region" aria-label="선택한 문의 일괄 처리">
      <strong>{checked.size}건 선택</strong>
      <select className="ac-btn ac-select" value="" onChange={(event) => bulkStatus(event.target.value)} disabled={busy} aria-label="선택한 문의 상태 변경"><option value="">상태 변경…</option>{INQUIRY_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select>
      <button type="button" className="ac-btn is-danger" onClick={bulkDelete} disabled={busy}>삭제</button>
      <button type="button" className="ac-btn is-ghost" onClick={() => setChecked(new Set())}>선택 해제</button>
    </div>}

    <div className={`ac-split${selected ? ' has-detail' : ''}`}>
      <section className="ac-card ac-table-card">
        {filtered.length > 0 && <label className="ac-check-all"><input type="checkbox" checked={allVisibleChecked} onChange={toggleAll} />표시된 {visible.length}건 전체 선택</label>}
        {filtered.length ? <ul className="ac-inquiry-list">{visible.map((item) => <li key={item.id} className={item.status === 'new' ? 'is-new' : undefined}>
          <input type="checkbox" className="ac-row-check" checked={checked.has(item.id)} onChange={() => toggleChecked(item.id)} aria-label={`${item.company_name} 선택`} />
          <button type="button" className={item.id === selectedId ? 'is-selected' : ''} onClick={() => setSelectedId(item.id)}>
            <span className="ac-inquiry-top"><strong>{item.company_name}</strong><span className={`ac-badge tone-${toneOf(item.status)}`}>{inquiryStatusLabel(item.status)}</span></span>
            <span className="ac-inquiry-meta">{item.contact_name} · {item.category}{item.files?.length ? ` · 첨부 ${item.files.length}` : ''}{item.admin_memo ? ' · 메모' : ''}</span>
            {item.product_title && <span className="ac-inquiry-product">{item.product_title}</span>}
            <time>{formatDateTime(item.created_at)}</time>
          </button>
        </li>)}</ul> : <p className="ac-empty">{inquiries.length ? '조건에 맞는 문의가 없습니다.' : '아직 접수된 문의가 없습니다.'}</p>}
        {filtered.length > limit && <button type="button" className="ac-more" onClick={() => setLimit((value) => value + PAGE_SIZE)}>더 보기 ({filtered.length - limit}건 남음)</button>}
      </section>

      {selected && <section className="ac-card ac-detail" aria-label="문의 상세">
        <div className="ac-detail-head">
          <button type="button" className="ac-back" onClick={() => setSelectedId(null)}>← 목록</button>
          <div><p className="ac-kicker">{formatDateTime(selected.created_at)} 접수{selected.updated_at && selected.updated_at !== selected.created_at ? ` · ${formatDateTime(selected.updated_at)} 수정` : ''}</p><h2>{selected.company_name}</h2></div>
        </div>
        <div className="ac-segment" role="group" aria-label="처리 상태">{INQUIRY_STATUSES.map((status) => <button key={status.id} type="button" className={selected.status === status.id ? `is-active tone-${status.tone}` : ''} onClick={() => changeStatus(status.id)}>{status.label}</button>)}</div>
        <dl className="ac-dl">
          <div><dt>담당자</dt><dd>{selected.contact_name}</dd></div>
          <div><dt>연락처</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div>
          <div><dt>이메일</dt><dd>{selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : '-'}</dd></div>
          <div><dt>문의 분야</dt><dd>{selected.category}</dd></div>
          {selected.product_title && <div><dt>문의 제품</dt><dd>{selected.product_title}</dd></div>}
        </dl>
        <div className="ac-quick">
          <a className="ac-btn" href={`tel:${selected.phone}`}>전화 걸기</a>
          {selected.email && <a className="ac-btn is-primary" href={replyMailto(selected)} onClick={() => { if (selected.status === 'new') changeStatus('in_progress'); }}>회신 메일 쓰기</a>}
          <button type="button" className="ac-btn" onClick={() => { navigator.clipboard?.writeText(`${selected.company_name} / ${selected.contact_name} / ${selected.phone}${selected.email ? ` / ${selected.email}` : ''}`).then(() => showToast('연락처를 복사했습니다.'), () => showToast('복사하지 못했습니다.', 'error')); }}>연락처 복사</button>
        </div>
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
