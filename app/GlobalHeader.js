'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './global-header.css';

const items = [['회사소개', '/company.html'], ['보유기술', '/technology.html'], ['제품소개', '/products'], ['솔루션', '/solutions.html'], ['적용분야', '/applications.html'], ['프로젝트', '/projects.html'], ['영상자료', '/videos'], ['문의', '/contact.html']];

export default function GlobalHeader() {
  const path = usePathname();
  const [languageVisible, setLanguageVisible] = useState(true);
  useEffect(() => { setLanguageVisible(!document.cookie.split('; ').includes('bmhf_language_visible=off')); }, []);
  if (path.startsWith('/admin')) return null;
  const english = path.startsWith('/en');
  return <header className="global-gnb"><a href="/index.html" className="global-logo"><img src="/assets/images/bmhf-logo-official.png" alt="BMHF 백마고주파" /></a><nav>{items.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>{languageVisible && <div className="global-language"><button type="button"><img src={`/assets/images/${english ? 'flag-us.svg' : 'flag-kr.svg'}`} alt="" />{english ? 'English' : '한국어'} <span>⌄</span></button><div><a href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><Link href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</Link></div></div>}<a className="global-quote" href="/contact.html">견적 문의</a></header>;
}
