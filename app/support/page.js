'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const welcome = '안녕하세요. 백마고주파 AI 고객센터입니다. 어떤 공정을 검토하고 계신가요?';
const quickQuestions = ['고주파 열처리 상담', '브레이징 장비 문의', '맞춤 코일 제작', '자동화 시스템 상담'];

function RobotMark({ small = false }) {
  return <span className={`robot-mark${small ? ' small' : ''}`} aria-hidden="true"><i /><b /><em /></span>;
}

export default function SupportPage() {
  const [mode, setMode] = useState('ai');
  const [messages, setMessages] = useState([{ role: 'assistant', text: welcome, suggestions: quickQuestions }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);
  async function send(value = input) {
    const text = value.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((items) => [...items, { role: 'user', text }]);
    setBusy(true);
    try {
      const response = await fetch('/api/support', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const body = await response.json();
      setMessages((items) => [...items, { role: 'assistant', text: body.answer || body.error || '잠시 후 다시 시도해 주세요.' }]);
    } catch {
      setMessages((items) => [...items, { role: 'assistant', text: '연결 상태를 확인해 주세요. 긴급한 상담은 전화로 도와드리겠습니다.' }]);
    } finally { setBusy(false); }
  }
  return <main className="support">
    <header className="nav"><Link href="/index.html" className="brand">BMHF</Link><nav><a href="/index.html">국문 사이트</a><Link href="/en">English</Link></nav></header>
    <section className="support-shell">
      <div className="support-hero"><div><p className="kicker">BMHF AI CUSTOMER CARE</p><h1>공정 상담을<br />더 빠르게 시작하세요.</h1><p>고주파 공정의 기본 정보를 먼저 확인하고, 필요한 경우 엔지니어 상담으로 연결합니다.</p></div><RobotMark /></div>
      <div className="support-layout">
        <div>
          <div className="support-tabs" role="tablist"><button className={mode === 'ai' ? 'active' : ''} onClick={() => setMode('ai')} type="button"><b>AI 실시간 상담</b><span>공정 조건을 바탕으로 안내</span></button><button className={mode === 'guide' ? 'active' : ''} onClick={() => setMode('guide')} type="button"><b>상담 준비 안내</b><span>견적 검토에 필요한 정보</span></button></div>
          {mode === 'guide' ? <section className="support-guide-card"><h2>상담 전에 준비해 주세요.</h2><div><strong>01</strong><p><b>워크피스 정보</b><span>재질, 형상, 치수, 가열 부위를 알려 주세요.</span></p></div><div><strong>02</strong><p><b>목표 공정</b><span>열처리, 브레이징, 가열 목적을 알려 주세요.</span></p></div><div><strong>03</strong><p><b>생산 조건</b><span>수량, 목표 시간, 설치 공간을 알려 주세요.</span></p></div><a className="button" href="/contact.html">프로젝트 문의하기</a></section> : <section className="chat" aria-label="AI 고객센터 채팅">
            <div className="chat-head"><RobotMark small /><div><span>AI CUSTOMER CARE</span><strong>BMHF 공정 상담</strong><p><i /> AI 상담사가 연결되었습니다.</p></div></div>
            <div className="messages" ref={listRef}>{messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>{message.role === 'assistant' && <RobotMark small />}<div><p className="bubble">{message.text}</p>{message.suggestions?.length ? <div className="suggestions">{message.suggestions.map((question) => <button key={question} type="button" onClick={() => void send(question)}>{question}</button>)}</div> : null}</div></div>)}{busy && <div className="message-row assistant"><RobotMark small /><p className="bubble typing">상담 내용을 확인하고 있습니다.</p></div>}</div>
            <form onSubmit={(event) => { event.preventDefault(); void send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="궁금한 공정이나 장비를 입력해 주세요." maxLength="1200" /><button className="button" disabled={busy || !input.trim()}>보내기</button></form>
          </section>}
        </div>
        <aside className="support-aside"><h2>AI 상담이 도와드려요.</h2><ul><li><b>기본 공정 안내</b><span>열처리, 브레이징, 유도가열</span></li><li><b>맞춤 설계 상담</b><span>코일, 지그, 냉각, 자동화</span></li><li><b>엔지니어 연결</b><span>사양 검토가 필요한 문의</span></li></ul><p>정확한 사양과 납기, 가격은 엔지니어 검토 후 안내합니다.</p><a href="tel:031-498-1292">전화 031-498-1292</a></aside>
      </div>
    </section>
  </main>;
}
