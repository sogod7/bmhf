import Link from 'next/link';
import { listInquiries } from '../../lib/inquiries';
import { storageMode, storageProblem } from '../../lib/store';

const NAV = [
  ['dashboard', '운영 현황', '/admin'],
  ['analytics', '접속 통계', '/admin/analytics'],
  ['inquiries', '문의 관리', '/admin/inquiries'],
  ['notices', '공지사항', '/admin/notices'],
  ['videos', '영상 관리', '/admin/videos'],
  ['resources', '기술자료', '/admin/resources'],
  ['settings', '설정', '/admin/settings'],
];

async function newInquiryCount() {
  try { return (await listInquiries()).filter((item) => item.status === 'new').length; } catch { return 0; }
}

export default async function AdminShell({ active, kicker, title, description, actions, children }) {
  const pending = await newInquiryCount();
  const mode = storageMode();
  const problem = await storageProblem();
  return <div className="ac">
    <aside className="ac-side">
      <a className="ac-brand" href="/admin"><img src="/assets/images/bmhf-logo-official.png" alt="BMHF" /><span>ADMIN</span></a>
      <nav className="ac-nav" aria-label="관리자 메뉴">
        {NAV.map(([key, label, href]) => <Link key={key} href={href} className={key === active ? 'is-active' : undefined} aria-current={key === active ? 'page' : undefined}>{label}{key === 'inquiries' && pending > 0 && <b className="ac-count">{pending}</b>}</Link>)}
      </nav>
      <div className="ac-side-foot">
        <a href="/index.html" target="_blank" rel="noreferrer">사이트 보기 ↗</a>
        <form action="/api/admin/auth" method="post"><button name="action" value="logout">로그아웃</button></form>
      </div>
    </aside>
    <main className="ac-main">
      {mode === 'local' && <p className={`ac-banner ${process.env.VERCEL ? 'is-warn' : ''}`}>{process.env.VERCEL ? '저장소(Supabase)가 연결되지 않았습니다. 지금은 기본 데이터만 보이며 변경 사항이 저장되지 않습니다. 설정 메뉴의 연결 안내를 확인하세요.' : '로컬 개발 저장소(data 폴더)를 사용 중입니다.'}</p>}
      {problem && <p className="ac-banner is-warn">Supabase 데이터베이스를 읽지 못해 저장·조회가 동작하지 않습니다(공개 페이지에는 기본 데이터만 표시). Supabase에서 마이그레이션(supabase/migrations) 실행 여부와 API 설정의 Exposed schemas에 bmhf가 포함됐는지 확인하세요.<br /><small>{problem}</small></p>}
      <header className="ac-head">
        <div><p className="ac-kicker">{kicker}</p><h1>{title}</h1>{description && <p className="ac-desc">{description}</p>}</div>
        {actions && <div className="ac-head-actions">{actions}</div>}
      </header>
      {children}
    </main>
  </div>;
}
