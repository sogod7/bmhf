'use client';

import { useEffect } from 'react';

export default function LanguageSwitch() {
  useEffect(() => {
    const brand = document.querySelector('.nav .brand');
    if (brand && !document.querySelector('[data-app-brand-slogan]')) {
      const slogan = document.createElement('span');
      slogan.dataset.appBrandSlogan = 'true';
      slogan.className = 'app-brand-slogan';
      slogan.innerHTML = '<span>주식회사 백마고주파</span><span>BAEK-MA High Frequency</span>';
      brand.insertAdjacentElement('afterend', slogan);
    }
    const nav = document.querySelector('.nav nav');
    if (!nav || nav.querySelector('[data-app-language-switch]')) return;
    const english = window.location.pathname.startsWith('/en');
    const switcher = document.createElement('div');
    switcher.dataset.appLanguageSwitch = 'true';
    switcher.className = 'app-language-switch';
    switcher.innerHTML = `<button type="button" aria-expanded="false"><img src="/assets/images/${english ? 'flag-us.svg' : 'flag-kr.svg'}" alt="" />${english ? 'English' : '한국어'} <span>⌄</span></button><div class="app-language-menu"><a class="${english ? '' : 'is-active'}" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a class="${english ? 'is-active' : ''}" href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a></div>`;
    switcher.querySelector('button').addEventListener('click', () => { const open = switcher.classList.toggle('is-open'); switcher.querySelector('button').setAttribute('aria-expanded', String(open)); });
    nav.appendChild(switcher);
  }, []);
  return null;
}
