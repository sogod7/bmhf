'use client';

import './login.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); router.replace('/admin'); router.refresh(); } catch (reason) { setError(reason.message || '로그인에 실패했습니다.'); } finally { setBusy(false); }
  }
  return <main className="admin-login"><section><a href="/index.html" className="brand">BMHF</a><p className="kicker dark">ADMINISTRATOR ONLY</p><h1>관리자 로그인</h1><p>운영 콘솔 접근을 위한 단일 관리자 계정입니다.</p><form onSubmit={submit}><label>아이디<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>비밀번호<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? '확인 중' : '로그인'}</button></form><a className="back-link" href="/index.html">사이트로 돌아가기</a></section></main>;
}
