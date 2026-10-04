
const toggle = document.querySelector('[data-menu-toggle]');
const panel = document.querySelector('[data-mobile-panel]');
if (toggle && panel) {
  toggle.addEventListener('click', () => panel.classList.toggle('is-open'));
  panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => panel.classList.remove('is-open')));
}

const footerBottom = document.querySelector('.footer-bottom');
if (footerBottom && !footerBottom.querySelector('[data-admin-login]')) {
  const adminLogin = document.createElement('a');
  adminLogin.href = '/admin';
  adminLogin.dataset.adminLogin = 'true';
  adminLogin.className = 'admin-login-link';
  adminLogin.textContent = '관리자 로그인';
  footerBottom.appendChild(adminLogin);
}

const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
if (isHome && !document.querySelector('[data-ai-support-launcher]')) {
  const launcher = document.createElement('a');
  launcher.href = '/support';
  launcher.dataset.aiSupportLauncher = 'true';
  launcher.className = 'ai-support-launcher';
  launcher.setAttribute('aria-label', 'AI 고객센터 열기');
  launcher.innerHTML = '<span class="ai-support-pulse"></span><span class="ai-support-robot" aria-hidden="true"><i></i><b></b><em></em></span><span class="ai-support-label">AI 고객센터<small>공정 상담</small></span>';
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
