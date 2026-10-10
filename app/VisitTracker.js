'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

// Loads the shared page-view beacon (/bmhf-v.js) and reports client-side navigations.
export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Wait a moment so document.title reflects the new page.
    const timer = setTimeout(() => window.__bmhfVisit?.(), 300);
    return () => clearTimeout(timer);
  }, [pathname]);
  return <Script src="/bmhf-v.js" strategy="afterInteractive" />;
}
