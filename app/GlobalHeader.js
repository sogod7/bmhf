'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './global-header.css';

const items = [['회사소개', '/company.html'], ['보유기술', '/technology.html'], ['제품소개', '/products'], ['적용분야', '/applications.html'], ['영상자료', '/videos'], ['공지사항', '/notices'], ['문의', '/contact.html']];

export default function GlobalHeader() {
  const path = usePathname();
  const [languageVisible, setLanguageVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setLanguageVisible(!document.cookie.split('; ').includes('bmhf_language_visible=off'));
    setMenuOpen(false);
  }, [path]);
  if (path.startsWith('/admin')) return null;
  const english = path.startsWith('/en');
  const closeMenu = () => setMenuOpen(false);
  return <header className="global-gnb">
    <a href="/index.html" className="global-logo" aria-label="BMHF 홈"><img src="/assets/images/bmhf-logo-official.png" alt="BMHF 백마고주파" /></a>
    <nav className="global-desktop-nav" aria-label="주요 메뉴">{items.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    {languageVisible && <div className="global-language"><button type="button"><img src={`/assets/images/${english ? 'flag-us.svg' : 'flag-kr.svg'}`} alt="" />{english ? 'English' : '한국어'} <span>⌄</span></button><div><a href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><Link href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</Link></div></div>}
    <a className="global-quote" href="/contact.html">견적 문의</a>
    <button className={`global-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
    <div className={`global-mobile-panel${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>{items.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}<a className="global-mobile-quote" href="/contact.html" onClick={closeMenu}>견적 문의</a></div>
  </header>;
}
