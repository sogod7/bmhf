'use client';

import { usePathname } from 'next/navigation';
import './global-ai-support.css';

export default function GlobalAiSupport() {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return <a className="global-ai-support" href="/support" aria-label="AI 고객센터 열기"><span className="global-ai-pulse" /><span className="global-ai-horse" aria-hidden="true" /><span className="global-ai-label">AI 고객센터</span></a>;
}
