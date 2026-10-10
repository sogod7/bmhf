'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Logo loading screen: covers the first page load and client-side navigations (site and admin).
// It fades in only after a short delay (see page-loader.css), so fast loads never flash it.
export default function PageLoader() {
  const ref = useRef(null);
  const timer = useRef(null);
  const pathname = usePathname();

  const hide = () => {
    clearTimeout(timer.current);
    ref.current?.classList.remove('is-active');
    ref.current?.classList.add('is-done');
  };

  useEffect(() => {
    if (document.readyState === 'complete') { hide(); return undefined; }
    window.addEventListener('load', hide, { once: true });
    const fallback = setTimeout(hide, 5000);
    return () => { window.removeEventListener('load', hide); clearTimeout(fallback); };
  }, []);

  // A navigation finished: the route changed. Also hide when the browser restores this page from the back/forward cache.
  useEffect(() => { if (document.readyState === 'complete') hide(); }, [pathname]);
  useEffect(() => {
    const restored = (event) => { if (event.persisted) hide(); };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);

  useEffect(() => {
    const show = (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (/\.(pdf|zip|docx?|xlsx?|pptx?|hwp|jpe?g|png)$/i.test(url.pathname) || url.pathname.startsWith('/api/')) return;
      const node = ref.current;
      if (!node) return;
      node.classList.remove('is-done');
      // Restart the delayed fade-in animation.
      node.style.animation = 'none'; void node.offsetWidth; node.style.animation = '';
      node.classList.add('is-active');
      clearTimeout(timer.current);
      timer.current = setTimeout(hide, 8000);
    };
    // Capture phase: next/link cancels the click (preventDefault) before a bubbling listener would see it.
    document.addEventListener('click', show, true);
    return () => document.removeEventListener('click', show, true);
  }, []);

  return <div ref={ref} className="page-loader" aria-hidden="true"><div className="page-loader-inner"><img src="/assets/images/bmhf-logo-official.png" alt="" /><span className="page-loader-bar"><i /></span></div></div>;
}
