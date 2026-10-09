
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
if (desktopNav) desktopNav.innerHTML = globalNavigation.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
const brand = document.querySelector('.header-inner .brand');
if (brand && !document.querySelector('[data-brand-slogan]')) {
  const slogan = document.createElement('span');
  slogan.dataset.brandSlogan = 'true';
  slogan.className = 'brand-slogan';
  slogan.innerHTML = '<span class="brand-authority" style="color:#123b6d">고주파 시스템의 권위</span><span class="brand-korean">주식회사 백마고주파</span><span class="brand-en"><b>B</b>AEK-<b>M</b>A <b>H</b>igh <b>F</b>requency</span><span class="brand-initial">BMHF</span>';
  brand.insertAdjacentElement('afterend', slogan);
}
if (desktopNav && !document.querySelector('[data-language-switch]')) {
  const languages = document.createElement('div');
  languages.dataset.languageSwitch = 'true';
  languages.className = 'language-switch';
  languages.innerHTML = '<button type="button" aria-expanded="false"><img src="/assets/images/flag-kr.svg" alt="" />한국어 <span>⌄</span></button><div class="language-menu"><a class="is-active" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a></div>';
  languages.querySelector('button').addEventListener('click', () => { const open = languages.classList.toggle('is-open'); languages.querySelector('button').setAttribute('aria-expanded', String(open)); });
  desktopNav.insertAdjacentElement('afterend', languages);
}
const mobileMenuData = [
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
      { label: '기술 자료실 (카탈로그 다운로드)', href: '/resources' }
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
];

const mobilePanel = document.querySelector('[data-mobile-panel]');
if (mobilePanel) {
  mobilePanel.innerHTML = `
    <div class="mobile-nav-accordion">
      ${mobileMenuData.map((group, idx) => `
        <div class="mobile-nav-group${idx === 2 ? ' is-expanded' : ''}" data-nav-group>
          <div class="mobile-nav-row">
            <a href="${group.href}" class="mobile-nav-title">
              <span>${group.label}</span>
              ${group.badge ? `<span class="mobile-nav-badge">${group.badge}</span>` : ''}
            </a>
            <button type="button" class="mobile-nav-toggle" aria-label="${group.label} 하위메뉴 열기/닫기" aria-expanded="${idx === 2 ? 'true' : 'false'}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="mobile-nav-sub">
            <div class="mobile-nav-sub-inner">
              ${group.items.map(item => `
                <a href="${item.href}" class="mobile-nav-sublink">
                  <span class="sublink-dot" aria-hidden="true"></span>
                  <span class="sublink-text">${item.label}</span>
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="mobile-panel-footer">
      <a class="mobile-panel-quote" href="/contact.html">
        <span>견적 문의하기</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
  `;

  // Accordion toggle
  mobilePanel.querySelectorAll('.mobile-nav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const group = btn.closest('[data-nav-group]');
      const open = group.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // Close panel on link click
  mobilePanel.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && toggle && panel) {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
if (mobilePanel && !mobilePanel.querySelector('[data-language-switch]')) {
  const languages = document.createElement('div');
  languages.dataset.languageSwitch = 'true';
  languages.className = 'language-switch mobile-language-switch';
  languages.innerHTML = '<button type="button" aria-expanded="false"><img src="/assets/images/flag-kr.svg" alt="" />한국어 <span>⌄</span></button><div class="language-menu"><a class="is-active" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a></div>';
  languages.querySelector('button').addEventListener('click', () => { const open = languages.classList.toggle('is-open'); languages.querySelector('button').setAttribute('aria-expanded', String(open)); });
  const footerArea = mobilePanel.querySelector('.mobile-panel-footer') || mobilePanel;
  footerArea.appendChild(languages);
}
// The admin console can hide the language switch for every visitor.
fetch('/api/settings').then((response) => response.json()).then((settings) => {
  if (settings.languageVisible === false) document.querySelectorAll('[data-language-switch]').forEach((element) => element.remove());
  showSiteBanner(settings.banner);
}).catch(() => {});
// Site-wide announcement strip; a visitor's dismissal sticks until the banner content changes.
function showSiteBanner(banner) {
  const siteHeader = document.querySelector('[data-header]');
  let dismissed = '';
  try { dismissed = localStorage.getItem('bmhf_banner_dismissed') || ''; } catch {}
  if (!banner || !siteHeader || banner.id === dismissed || document.querySelector('.site-banner')) return;
  const strip = document.createElement('div');
  strip.className = 'site-banner'; strip.setAttribute('role', 'region'); strip.setAttribute('aria-label', '안내');
  const text = document.createElement('span'); text.textContent = banner.text; strip.appendChild(text);
  if (banner.link) { const link = document.createElement('a'); link.href = banner.link; link.textContent = '자세히 보기 →'; strip.appendChild(link); }
  const close = document.createElement('button'); close.type = 'button'; close.setAttribute('aria-label', '안내 닫기'); close.textContent = '×';
  close.addEventListener('click', () => { try { localStorage.setItem('bmhf_banner_dismissed', banner.id); } catch {} strip.remove(); });
  strip.appendChild(close);
  siteHeader.before(strip);
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
  // Pre-fill from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const paramCategory = urlParams.get('category');
  const paramProduct = urlParams.get('product');
  const paramTitle = urlParams.get('title');

  if (paramCategory) {
    const categoryMap = {
      'heat-treatment': '고주파 열처리',
      'brazing': '고주파 브레이징',
      'heating': '고주파 가열기',
    };
    const mapped = categoryMap[paramCategory] || paramCategory;
    const select = form.querySelector('select[name="category"]');
    if (select) {
      for (const opt of select.options) {
        if (opt.value.includes(mapped) || opt.text.includes(mapped)) {
          select.value = opt.value;
          break;
        }
      }
    }
  }

  if (paramProduct || paramTitle) {
    const banner = form.querySelector('[data-product-banner]');
    const bannerTitle = form.querySelector('[data-product-banner-title]');
    const slugInput = form.querySelector('[data-product-slug]');
    const titleInput = form.querySelector('[data-product-title]');
    const messageArea = form.querySelector('textarea[name="message"]');

    const displayTitle = paramTitle || paramProduct;
    if (banner && bannerTitle) {
      banner.style.display = 'block';
      bannerTitle.textContent = displayTitle;
    }
    if (slugInput) slugInput.value = paramProduct || '';
    if (titleInput) titleInput.value = displayTitle || '';
    if (messageArea && !messageArea.value.trim()) {
      messageArea.value = `[문의 설비: ${displayTitle}]\n\n- 적용 부품 및 재질: \n- 규격/치수: \n- 목표 온도 및 공정: \n- 일일/월간 생산량: `;
    }
  }

  // Handle actual submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[data-submit-btn]');
    const feedback = form.querySelector('[data-form-feedback]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '문의 접수 중입니다...';
    }
    if (feedback) {
      feedback.style.display = 'none';
      feedback.className = 'form-feedback';
    }

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries([...formData.entries()].filter(([, value]) => typeof value === 'string'));
      const files = formData.getAll('files').filter((file) => file && file.size > 0);
      if (files.length) {
        if (submitBtn) submitBtn.textContent = '첨부파일 업로드 중입니다...';
        const signRes = await fetch('/api/inquiries/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })) }) });
        const signed = await signRes.json();
        if (!signRes.ok) throw new Error(signed.error || '첨부파일을 업로드하지 못했습니다.');
        await Promise.all(signed.uploads.map(async (upload, index) => {
          const putRes = await fetch(upload.uploadUrl, { method: 'PUT', headers: { 'Content-Type': files[index].type || 'application/octet-stream' }, body: files[index] });
          if (!putRes.ok) throw new Error(`첨부파일 업로드 실패: ${upload.name}`);
        }));
        payload.files = signed.uploads.map(({ path, name, size, type }) => ({ path, name, size, type }));
        if (submitBtn) submitBtn.textContent = '문의 접수 중입니다...';
      }
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (feedback) {
        feedback.style.display = 'block';
        if (res.ok && result.success) {
          feedback.style.background = '#e6f7ec';
          feedback.style.color = '#155724';
          feedback.style.border = '1px solid #c3e6cb';
          feedback.innerHTML = `<strong>✓ 접수 완료</strong><br />${result.message}`;
          form.reset();
        } else {
          feedback.style.background = '#fde8e8';
          feedback.style.color = '#721c24';
          feedback.style.border = '1px solid #f5c6cb';
          feedback.innerHTML = `<strong>✕ 접수 실패</strong><br />${result.error || '접수 중 문제가 발생했습니다. 전화(031-498-1292)로 문의해 주시기 바랍니다.'}`;
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.background = '#fde8e8';
        feedback.style.color = '#721c24';
        feedback.style.border = '1px solid #f5c6cb';
        feedback.innerHTML = '<strong>✕ 전송 오류</strong><br />';
        feedback.append(err?.message && !/fetch|network/i.test(err.message) ? err.message : '네트워크 연결을 확인하신 후 다시 시도해 주세요.');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '견적 및 기술상담 신청하기';
      }
    }
  });
}
const homeHero = document.querySelector('.hero-home');
if (homeHero && !document.querySelector('[data-home-notices]')) {
  const defaults = [{ title: 'BMHF 고주파 시스템 기술 상담 안내', date: '2026.10.05', pinned: true, visible: true }, { title: '제품소개 및 영상자료 업데이트', date: '2026.10.01', pinned: false, visible: true }];
  const section = document.createElement('section');
  section.className = 'home-notice-section'; section.dataset.homeNotices = 'true';
  const container = document.createElement('div'); container.className = 'container home-notice-inner';
  const heading = document.createElement('div'); heading.innerHTML = '<p class="eyebrow blue">Notice</p><h2>공지사항</h2>'; container.appendChild(heading);
  const list = document.createElement('div'); list.className = 'home-notice-list';
  const renderNotices = (notices) => list.replaceChildren(...notices.slice(0, 3).map((notice) => { const link = document.createElement('a'); link.href = '/notices'; const title = document.createElement('strong'); title.textContent = notice.title; const meta = document.createElement('span'); meta.textContent = `${notice.pinned ? '고정 · ' : ''}${notice.date}`; link.append(title, meta); return link; }));
  renderNotices(defaults);
  fetch('/api/notices?limit=3').then((response) => response.json()).then((data) => { if (Array.isArray(data.notices) && data.notices.length) renderNotices(data.notices); }).catch(() => {});
  container.appendChild(list); const more = document.createElement('a'); more.className = 'text-link'; more.href = '/notices'; more.textContent = '공지사항 전체보기 →'; container.appendChild(more); section.appendChild(container);
  document.querySelector('.cta-section')?.before(section);
}
