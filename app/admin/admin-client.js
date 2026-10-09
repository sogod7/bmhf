'use client';

import { useCallback, useEffect, useState } from 'react';

// JSON request helper for admin APIs; sends the admin back to login when the session expires.
export async function api(url, { method = 'GET', body } = {}) {
  const response = await fetch(url, { method, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (response.status === 401) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('로그인이 만료되었습니다.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했습니다.');
  return data;
}

// Ask the server for a signed URL, then PUT the file straight to storage.
export async function uploadFile(signEndpoint, file) {
  const { path, uploadUrl } = await api(signEndpoint, { method: 'POST', body: { name: file.name, size: file.size, type: file.type } });
  const response = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
  if (!response.ok) throw new Error('파일 업로드에 실패했습니다.');
  return { path, name: file.name, size: file.size };
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, tone = 'ok') => setToast({ message, tone, key: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), toast.tone === 'error' ? 4200 : 2400);
    return () => clearTimeout(timer);
  }, [toast]);
  const node = toast ? <p key={toast.key} className={`ac-toast is-${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>{toast.message}</p> : null;
  return [node, show];
}

export function Toggle({ checked, onChange, label, disabled }) {
  return <button type="button" className={`ac-switch${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked} disabled={disabled}><span aria-hidden="true" />{label}</button>;
}
