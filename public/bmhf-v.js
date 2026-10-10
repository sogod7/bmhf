// BMHF first-party page-view beacon (접속 통계). Loaded by every public page: static pages via
// assets/js/main.js, app pages via app/VisitTracker.js (which also calls it on client-side navigation).
// Stores no personal data: a random visitor id and a 30-minute session live in this browser's localStorage.
(() => {
  if (window.__bmhfVisit) return;
  const SESSION_MS = 30 * 60 * 1000;
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const readJson = (key) => { try { return JSON.parse(read(key) || 'null'); } catch { return null; } };
  const randomId = () => (window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`);
  const hostOf = (url) => { try { return new URL(url).hostname; } catch { return ''; } };

  // Browsers that open the admin console are the site's own staff: never count them.
  if (location.pathname.startsWith('/admin')) write('bmhf_admin', '1');

  let lastKey = null;
  function visit() {
    if (location.pathname.startsWith('/admin') || read('bmhf_admin') === '1' || navigator.webdriver) return;
    const key = location.pathname + location.search;
    if (key === lastKey) return;
    lastKey = key;

    let visitor = read('bmhf_vid');
    if (!visitor) { visitor = randomId(); write('bmhf_vid', visitor); }

    // A session ends after 30 idle minutes, or when the visitor arrives again from another site or a campaign link.
    const now = Date.now();
    const referrer = document.referrer && hostOf(document.referrer) !== location.hostname ? document.referrer : '';
    const url = location.pathname + location.search;
    const campaign = /[?&](utm_source|gclid|gad_source|n_media|n_keyword)=/.test(location.search);
    let session = readJson('bmhf_sess');
    let landing = false;
    if (!session || now - session.at > SESSION_MS || (referrer && referrer !== session.r) || (campaign && url !== session.u)) {
      session = { id: randomId(), r: referrer, u: url, start: now };
      landing = true;
    }
    session.at = now;
    write('bmhf_sess', JSON.stringify(session));
    if (!read('bmhf_first')) write('bmhf_first', JSON.stringify({ r: session.r, u: session.u, at: session.start }));

    const body = JSON.stringify({ v: visitor, s: session.id, l: landing, p: url, t: document.title, r: session.r, u: session.u, lang: navigator.language });
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/visit', body))) fetch('/api/visit', { method: 'POST', body, keepalive: true }).catch(() => {});
  }

  window.__bmhfVisit = visit;
  // Sent along with quote inquiries so the admin can see which channel produced each lead.
  window.__bmhfAttribution = () => ({ visitor: read('bmhf_vid'), first: readJson('bmhf_first'), session: (({ r, u, start } = {}) => ({ r, u, at: start }))(readJson('bmhf_sess') || {}) });

  if (document.readyState === 'complete') setTimeout(visit, 0);
  else window.addEventListener('load', () => setTimeout(visit, 0), { once: true });
})();
