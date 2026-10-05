
const toggle = document.querySelector('[data-menu-toggle]');
const panel = document.querySelector('[data-mobile-panel]');
if (toggle) {
  while (toggle.querySelectorAll('span').length < 3) toggle.appendChild(document.createElement('span'));
  toggle.setAttribute('aria-expanded', 'false');
}
if (toggle && panel) {
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { panel.classList.remove('is-open'); toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }));
}

const footerBottom = document.querySelector('.footer-bottom');
if (footerBottom && !footerBottom.querySelector('[data-admin-login]')) {
  const adminLogin = document.createElement('a');
  adminLogin.href = 'https://bmhf.vercel.app/admin/login';
  adminLogin.dataset.adminLogin = 'true';
  adminLogin.className = 'admin-login-link';
  adminLogin.textContent = '관리자 로그인';
  footerBottom.appendChild(adminLogin);
}

const desktopNav = document.querySelector('.desktop-nav');
const globalNavigation = [['회사소개', '/company.html'], ['보유기술', '/technology.html'], ['제품소개', '/products'], ['적용분야', '/applications.html'], ['영상자료', '/videos'], ['공지사항', '/notices'], ['문의', '/contact.html']];
const languageVisible = !document.cookie.split('; ').includes('bmhf_language_visible=off');
if (desktopNav) desktopNav.innerHTML = globalNavigation.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
const brand = document.querySelector('.header-inner .brand');
if (brand && !document.querySelector('[data-brand-slogan]')) {
  const slogan = document.createElement('span');
  slogan.dataset.brandSlogan = 'true';
  slogan.className = 'brand-slogan';
  slogan.innerHTML = '<span class="brand-authority" style="color:#123b6d">고주파 시스템의 권위</span><span class="brand-korean">주식회사 백마고주파</span><span class="brand-en"><b>B</b>AEK-<b>M</b>A <b>H</b>igh <b>F</b>requency</span><span class="brand-initial">BMHF</span>';
  brand.insertAdjacentElement('afterend', slogan);
}
if (languageVisible && desktopNav && !document.querySelector('[data-language-switch]')) {
  const languages = document.createElement('div');
  languages.dataset.languageSwitch = 'true';
  languages.className = 'language-switch';
  languages.innerHTML = '<button type="button" aria-expanded="false"><img src="/assets/images/flag-kr.svg" alt="" />한국어 <span>⌄</span></button><div class="language-menu"><a class="is-active" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a></div>';
  languages.querySelector('button').addEventListener('click', () => { const open = languages.classList.toggle('is-open'); languages.querySelector('button').setAttribute('aria-expanded', String(open)); });
  desktopNav.insertAdjacentElement('afterend', languages);
}
const mobilePanel = document.querySelector('[data-mobile-panel]');
if (mobilePanel) mobilePanel.innerHTML = globalNavigation.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
if (languageVisible && mobilePanel && !mobilePanel.querySelector('[data-language-switch]')) {
  const languages = document.createElement('div');
  languages.dataset.languageSwitch = 'true';
  languages.className = 'language-switch mobile-language-switch';
  languages.innerHTML = '<button type="button" aria-expanded="false"><img src="/assets/images/flag-kr.svg" alt="" />한국어 <span>⌄</span></button><div class="language-menu"><a class="is-active" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a></div>';
  languages.querySelector('button').addEventListener('click', () => { const open = languages.classList.toggle('is-open'); languages.querySelector('button').setAttribute('aria-expanded', String(open)); });
  mobilePanel.appendChild(languages);
}

const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
const heroVideos = [...document.querySelectorAll('[data-hero-video]')];
if (heroVideos.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const playVideo = (index) => {
    heroVideos.forEach((video, videoIndex) => {
      const active = videoIndex === index;
      video.classList.toggle('is-active', active);
      if (!active) { video.pause(); video.currentTime = 0; }
    });
    heroVideos[index].play().catch(() => {});
  };
  heroVideos.forEach((video, index) => video.addEventListener('ended', () => playVideo((index + 1) % heroVideos.length)));
  playVideo(0);
}
if (!document.querySelector('[data-ai-support-launcher]')) {
  const launcher = document.createElement('a');
  launcher.href = '/support';
  launcher.dataset.aiSupportLauncher = 'true';
  launcher.className = 'ai-support-launcher';
  launcher.setAttribute('aria-label', 'AI 고객센터 열기');
  launcher.innerHTML = '<span class="ai-support-pulse"></span><span class="ai-support-horse" aria-hidden="true"></span><span class="ai-support-label">AI 고객센터<small>공정 상담</small></span>';
  document.body.appendChild(launcher);
}
const header = document.querySelector('[data-header]');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 20);
});
const form = document.querySelector('[data-quote-form]');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.querySelector('[data-form-note]');
    const data = Object.fromEntries(new FormData(form).entries());
    const lines = [
      '문의 내용이 화면에서 확인되었습니다. 실제 운영 시 이메일/게시판/CRM 연동이 필요합니다.',
      `회사명: ${data.company || '-'}`,
      `담당자: ${data.name || '-'}`,
      `연락처: ${data.phone || '-'}`,
      `문의 분야: ${data.category || '-'}`,
    ];
    if (note) note.textContent = lines.join(' / ');
  });
}
const homeHero = document.querySelector('.hero-home');
if (homeHero && !document.querySelector('[data-home-notices]')) {
  const defaults = [{ title: 'BMHF 고주파 시스템 기술 상담 안내', date: '2026.10.05', pinned: true, visible: true }, { title: '제품소개 및 영상자료 업데이트', date: '2026.10.01', pinned: false, visible: true }];
  let notices = defaults;
  try { const saved = localStorage.getItem('bmhf-notice-draft'); if (saved) notices = JSON.parse(saved); } catch {}
  notices = notices.filter((item) => item.visible).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)).slice(0, 3);
  const section = document.createElement('section');
  section.className = 'home-notice-section'; section.dataset.homeNotices = 'true';
  const container = document.createElement('div'); container.className = 'container home-notice-inner';
  const heading = document.createElement('div'); heading.innerHTML = '<p class="eyebrow blue">Notice</p><h2>공지사항</h2>'; container.appendChild(heading);
  const list = document.createElement('div'); list.className = 'home-notice-list';
  notices.forEach((notice) => { const link = document.createElement('a'); link.href = '/notices'; const title = document.createElement('strong'); title.textContent = notice.title; const meta = document.createElement('span'); meta.textContent = `${notice.pinned ? '고정 · ' : ''}${notice.date}`; link.append(title, meta); list.appendChild(link); });
  container.appendChild(list); const more = document.createElement('a'); more.className = 'text-link'; more.href = '/notices'; more.textContent = '공지사항 전체보기 →'; container.appendChild(more); section.appendChild(container);
  document.querySelector('.cta-section')?.before(section);
}
