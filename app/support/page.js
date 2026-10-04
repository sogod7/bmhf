'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: '안녕하세요. BMHF AI 고객센터입니다. 어떤 공정을 검토하고 계신가요?' }]);
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false);
  async function send(event) { event.preventDefault(); const text = input.trim(); if (!text || busy) return; setInput(''); setMessages((v) => [...v, { role: 'user', text }]); setBusy(true); try { const res = await fetch('/api/support', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: text }) }); const body = await res.json(); setMessages((v) => [...v, { role: 'assistant', text: body.answer || body.error || '잠시 후 다시 시도해 주세요.' }]); } catch { setMessages((v) => [...v, { role: 'assistant', text: '연결 상태를 확인해 주세요.' }]); } finally { setBusy(false); } }
  return <main className="support"><header className="nav"><Link href="/index.html" className="brand">BMHF</Link><nav><a href="/index.html">한국어 사이트</a><Link href="/en">English</Link></nav></header><section className="support-wrap"><div className="support-intro"><p className="kicker dark">AI CUSTOMER CENTER</p><h1>공정 상담을<br />빠르게 시작하세요.</h1><p>기술 확정은 엔지니어가 검토합니다.</p><a href="tel:031-498-1292" className="button">전화 상담</a></div><div className="chat"><div className="chat-head"><strong>BMHF AI 상담</strong><span>기술 안내 · 24/7</span></div><div className="messages">{messages.map((m, i) => <p className={`bubble ${m.role}`} key={i}>{m.text}</p>)}{busy && <p className="bubble assistant">답변을 준비하고 있습니다.</p>}</div><form onSubmit={send}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="예: 샤프트 열처리 장비를 검토 중입니다." maxLength="1200" /><button className="button" disabled={busy}>전송</button></form></div></section></main>;
}
