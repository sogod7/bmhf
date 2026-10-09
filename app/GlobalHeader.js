'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { englishPath, koreanPath, navigation } from '../lib/i18n';
import './global-header.css';

const headerMenuData = {
  ko: [
    {
      label: '회사소개',
      href: '/company.html',
      items: [
        { label: '회사소개 개요', href: '/company.html' },
        { label: '기업개요 및 핵심가치', href: '/company.html#about' },
        { label: '회사 정보 및 연혁', href: '/company.html#info' },
        { label: '오시는 길 (본사/공장)', href: '/contact.html#map' }
      ]
    },
    {
      label: '보유기술',
      href: '/technology.html',
      items: [
        { label: '보유기술 전체', href: '/technology.html' },
        { label: 'RF 전원 & 임피던스 매칭', href: '/technology.html#rf-power' },
        { label: '맞춤 인덕터 코일 & 지그', href: '/technology.html#coil-design' },
        { label: '냉각 제어 & 신뢰성 검증', href: '/technology.html#cooling' }
      ]
    },
    {
      label: '제품소개',
      href: '/products',
      badge: '주요설비',
      items: [
        { label: '전체 설비 라인업', href: '/products' },
        { label: '고주파 열처리·템퍼링 M/C', href: '/products#heat-treatment' },
        { label: '고주파 브레이징 M/C', href: '/products#brazing' },
        { label: '고주파 유도가열기 시스템', href: '/products#heating' }
      ]
    },
    {
      label: '적용분야',
      href: '/applications.html',
      items: [
        { label: '적용분야 전체', href: '/applications.html' },
        { label: '자동차 핵심 부품 열처리', href: '/applications.html#automotive' },
        { label: '초경 공구 브레이징 접합', href: '/applications.html#tools' },
        { label: '모터 케이스 & 산업기계 가열', href: '/applications.html#industrial' }
      ]
    },
    {
      label: '영상자료',
      href: '/videos',
      items: [
        { label: '설비 가동 영상 전체', href: '/videos' }
      ]
    },
    {
      label: '공지사항',
      href: '/notices',
      items: [
        { label: '공지사항 및 뉴스', href: '/notices' },
        { label: '기술 자료실 (카탈로그)', href: '/resources' }
      ]
    },
    {
      label: '문의',
      href: '/contact.html',
      items: [
        { label: '온라인 견적 문의하기', href: '/contact.html' },
        { label: 'AI 고객센터 (공정상담)', href: '/support' }
      ]
    }
  ],
  en: [
    {
      label: 'Company',
      href: '/en/company',
      items: [
        { label: 'About BMHF', href: '/en/company' },
        { label: 'Engineering Philosophy', href: '/en/company#about' },
        { label: 'Facility & Global Reach', href: '/en/company#info' }
      ]
    },
    {
      label: 'Technology',
      href: '/en/technology',
      items: [
        { label: 'Core Technology', href: '/en/technology' },
        { label: 'RF Power & Matching', href: '/en/technology#rf-power' },
        { label: 'Custom Coil Design', href: '/en/technology#coil-design' }
      ]
    },
    {
      label: 'Products',
      href: '/en/products',
      badge: 'Systems',
      items: [
        { label: 'Full Product Catalog', href: '/en/products' },
        { label: 'Induction Heat Treatment', href: '/en/products#heat-treatment' },
        { label: 'Induction Brazing M/C', href: '/en/products#brazing' },
        { label: 'High Frequency Heaters', href: '/en/products#heating' }
      ]
    },
    {
      label: 'Applications',
      href: '/en/applications',
      items: [
        { label: 'Automotive Components', href: '/en/applications#automotive' },
        { label: 'Cutting Tool Brazing', href: '/en/applications#tools' },
        { label: 'Motor & Industrial Machinery', href: '/en/applications#industrial' }
      ]
    },
    {
      label: 'Videos',
      href: '/en/videos',
      items: [
        { label: 'Machinery Video Library', href: '/en/videos' }
      ]
    },
    {
      label: 'News',
      href: '/en/notices',
      items: [
        { label: 'Announcements & News', href: '/en/notices' },
        { label: 'Technical Downloads', href: '/en/resources' }
      ]
    },
    {
      label: 'Contact',
      href: '/en/contact',
      items: [
        { label: 'Request an RF Quote', href: '/en/contact' }
      ]
    }
  ]
};

export default function GlobalHeader() {
  const path = usePathname();
  const [languageVisible, setLanguageVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(2); // Default to Products
  useEffect(() => {
    let active = true;
    fetch('/api/settings').then((response) => response.json()).then((settings) => { if (active) setLanguageVisible(settings.languageVisible !== false); }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => { setMenuOpen(false); }, [path]);
  if (path.startsWith('/admin')) return null;
  const english = path.startsWith('/en');
  const items = navigation[english ? 'en' : 'ko'];
  const menuGroups = headerMenuData[english ? 'en' : 'ko'];
  const homePath = english ? '/en' : '/index.html';
  const contactPath = english ? '/en/contact' : '/contact.html';
  const closeMenu = () => setMenuOpen(false);

  const toggleAccordion = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  return <header className="global-gnb">
    <a href={homePath} className="global-logo" aria-label="BMHF home"><img src="/assets/images/bmhf-logo-official.png" alt="BMHF Baek-Ma High Frequency" /></a>
    <span className="app-brand-slogan global-slogan" aria-hidden="true"><span className="brand-authority">고주파 시스템의 권위</span><span className="brand-korean">주식회사 백마고주파</span><span className="brand-en"><b>B</b>AEK-<b>M</b>A <b>H</b>igh <b>F</b>requency</span><span className="brand-initial">BMHF</span></span>
    <nav className="global-desktop-nav" aria-label="주요 메뉴">{items.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    {languageVisible && <div className="global-language"><button type="button"><img src={`/assets/images/${english ? 'flag-us.svg' : 'flag-kr.svg'}`} alt="" />{english ? 'English' : '한국어'} <span>⌄</span></button><div><a href={koreanPath(path)}><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><Link href={englishPath(path)}><img src="/assets/images/flag-us.svg" alt="" />English</Link></div></div>}
    <a className="global-quote" href={contactPath}>{english ? 'Request a quote' : '견적 문의'}</a>
    <button className={`global-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
    <div className={`global-mobile-panel${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
      <div className="global-mobile-accordion">
        {menuGroups.map((group, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={group.href} className={`global-mobile-group${isExpanded ? ' is-expanded' : ''}`}>
              <div className="global-mobile-row">
                <a href={group.href} className="global-mobile-title" onClick={closeMenu}>
                  <span>{group.label}</span>
                  {group.badge && <span className="global-mobile-badge">{group.badge}</span>}
                </a>
                <button type="button" className="global-mobile-toggle" aria-label={`${group.label} sub-items`} aria-expanded={isExpanded} onClick={(e) => toggleAccordion(idx, e)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <div className="global-mobile-sub">
                <div className="global-mobile-sub-inner">
                  {group.items.map((item) => (
                    <a key={item.href} href={item.href} className="global-mobile-sublink" onClick={closeMenu}>
                      <span className="global-sublink-dot" aria-hidden="true" />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="global-mobile-footer">
        <a className="global-mobile-quote-btn" href={contactPath} onClick={closeMenu}>
          <span>{english ? 'Request a quote' : '견적 문의하기'}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </div>
  </header>;
}
