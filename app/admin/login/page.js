'use client';

import './login.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const REMEMBER_KEY = 'bmhf_admin_email';

function nextPath() {
  const next = new URLSearchParams(window.location.search).get('next') || '';
  return next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin';
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false); const [capsLock, setCapsLock] = useState(false); const [remember, setRemember] = useState(false);
  useEffect(() => {
    try { const saved = localStorage.getItem(REMEMBER_KEY); if (saved) { setEmail(saved); setRemember(true); } } catch {}
  }, []);
  function detectCaps(event) { setCapsLock(Boolean(event.getModifierState?.('CapsLock'))); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      try { if (remember) localStorage.setItem(REMEMBER_KEY, email.trim()); else localStorage.removeItem(REMEMBER_KEY); } catch {}
      router.replace(nextPath()); router.refresh();
    } catch (reason) { setError(reason.message || '로그인에 실패했습니다.'); setPassword(''); setBusy(false); }
  }
  return <main className="admin-login">
    <aside className="login-visual">
      <a href="/index.html" className="login-logo" aria-label="BMHF 홈"><img src="/assets/images/bmhf-logo-official.png" alt="BMHF 백마고주파" /></a>
      <div className="login-visual-copy">
        <p className="kicker">BMHF OPERATIONS CONSOLE</p>
        <h2>웹사이트 운영을<br />한곳에서 관리합니다.</h2>
        <ul><li>견적 문의 접수와 처리 현황</li><li>공지사항 발행과 상단 고정</li><li>영상 자료와 다국어 노출 설정</li></ul>
      </div>
      <small>© BEAK-MA HIGH FREQUENCY</small>
    </aside>
    <section className="login-panel">
      <div className="login-card">
        <p className="kicker dark">ADMINISTRATOR ONLY</p>
        <h1>관리자 로그인</h1>
        <p className="login-lead">운영 콘솔 접근을 위한 관리자 계정으로 로그인하세요.</p>
        <form onSubmit={submit}>
          <label>아이디(이메일)<input type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="admin@bmhf.co.kr" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>비밀번호<span className="login-password"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="비밀번호" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={detectCaps} onKeyUp={detectCaps} onBlur={() => setCapsLock(false)} required /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-pressed={showPassword} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}>{showPassword ? '숨기기' : '표시'}</button></span></label>
          {capsLock && <p className="login-hint">Caps Lock이 켜져 있습니다.</p>}
          <label className="login-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />이 기기에서 아이디 기억하기</label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" disabled={busy}>{busy ? <><i className="login-spinner" aria-hidden="true" />확인 중</> : '로그인'}</button>
        </form>
        <a className="back-link" href="/index.html">← 사이트로 돌아가기</a>
      </div>
    </section>
  </main>;
}
