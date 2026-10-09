
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
const mobilePanel = document.querySelector('[data-mobile-panel]');
if (mobilePanel) mobilePanel.innerHTML = globalNavigation.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
if (mobilePanel && !mobilePanel.querySelector('[data-language-switch]')) {
  const languages = document.createElement('div');
  languages.dataset.languageSwitch = 'true';
  languages.className = 'language-switch mobile-language-switch';
  languages.innerHTML = '<button type="button" aria-expanded="false"><img src="/assets/images/flag-kr.svg" alt="" />한국어 <span>⌄</span></button><div class="language-menu"><a class="is-active" href="/index.html"><img src="/assets/images/flag-kr.svg" alt="" />한국어</a><a href="/en"><img src="/assets/images/flag-us.svg" alt="" />English</a></div>';
  languages.querySelector('button').addEventListener('click', () => { const open = languages.classList.toggle('is-open'); languages.querySelector('button').setAttribute('aria-expanded', String(open)); });
  mobilePanel.appendChild(languages);
}
// The admin console can hide the language switch for every visitor.
fetch('/api/settings').then((response) => response.json()).then((settings) => {
  if (settings.languageVisible === false) document.querySelectorAll('[data-language-switch]').forEach((element) => element.remove());
}).catch(() => {});

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
