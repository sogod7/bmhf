'use client';

import { useEffect } from 'react';

// Opens the collapsed notice named in the URL hash (/notices#notice-<id>) and scrolls to it.
export default function OpenFromHash() {
  useEffect(() => {
    const open = () => {
      const target = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target?.tagName !== 'DETAILS') return;
      target.open = true;
      target.scrollIntoView({ block: 'start' });
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  return null;
}
