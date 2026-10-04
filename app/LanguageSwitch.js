'use client';

import { useEffect } from 'react';

export default function LanguageSwitch() {
  useEffect(() => {
    const brand = document.querySelector('.nav .brand');
    if (brand && !document.querySelector('[data-app-brand-slogan]')) {
      const slogan = document.createElement('span');
      slogan.dataset.appBrandSlogan = 'true';
      slogan.className = 'app-brand-slogan';
      slogan.innerHTML = '<span>백마고주파</span><span>BAEK-MA High Frequency</span>';
      brand.insertAdjacentElement('afterend', slogan);
    }
    const nav = document.querySelector('.nav nav');
    if (!nav || nav.querySelector('[data-app-language-switch]')) return;
    const english = window.location.pathname.startsWith('/en');
    const switcher = document.createElement('div');
    switcher.dataset.appLanguageSwitch = 'true';
    switcher.className = 'app-language-switch';
    switcher.innerHTML = `<a class="${english ? '' : 'is-active'}" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a class="${english ? 'is-active' : ''}" href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a>`;
    nav.appendChild(switcher);
  }, []);
  return null;
}
