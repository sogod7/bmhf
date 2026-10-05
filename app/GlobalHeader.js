'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { englishPath, koreanPath, navigation } from '../lib/i18n';
import './global-header.css';

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
  const items = navigation[english ? 'en' : 'ko'];
  const homePath = english ? '/en' : '/index.html';
  const contactPath = english ? '/en/contact' : '/contact.html';
  const closeMenu = () => setMenuOpen(false);
  return <header className="global-gnb">
    <a href={homePath} className="global-logo" aria-label="BMHF home"><img src="/assets/images/bmhf-logo-official.png" alt="BMHF Baek-Ma High Frequency" /></a>
    <nav className="global-desktop-nav" aria-label="주요 메뉴">{items.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    {languageVisible && <div className="global-language"><button type="button"><img src={`/assets/images/${english ? 'flag-us.svg' : 'flag-kr.svg'}`} alt="" />{english ? 'English' : '한국어'} <span>⌄</span></button><div><a href={koreanPath(path)}><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><Link href={englishPath(path)}><img src="/assets/images/flag-us.svg" alt="" />English</Link></div></div>}
    <a className="global-quote" href={contactPath}>{english ? 'Request a quote' : '견적 문의'}</a>
    <button className={`global-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
    <div className={`global-mobile-panel${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>{items.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}<a className="global-mobile-quote" href={contactPath} onClick={closeMenu}>{english ? 'Request a quote' : '견적 문의'}</a></div>
  </header>;
}
