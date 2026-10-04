import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../lib/admin-auth';
import LanguageVisibilityControl from './LanguageVisibilityControl';

const rows = [['신규 문의', '엔지니어 배정 대기', '0'], ['게시물', '공지와 기술 소식', '0'], ['기술자료', '카탈로그와 인증서', '0'], ['프로젝트', '공개 상태 점검', '0']];

export default async function Admin() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin');
  return <main className="admin"><aside><strong>BMHF ADMIN</strong><a href="#overview">운영 현황</a><a href="#inquiries">문의 관리</a><a href="#content">콘텐츠 관리</a><a href="#resources">기술자료</a><a href="#ai">AI 고객센터</a><a href="#language">다국어 노출</a><a href="/index.html">사이트 보기</a></aside><section><div className="admin-head"><div><p className="kicker dark">OPERATIONS CONSOLE</p><h1>운영 현황</h1><p>문의, 콘텐츠, AI 상담을 한곳에서 관리합니다.</p></div><form action="/api/admin/auth" method="post"><button name="action" value="logout">로그아웃</button></form></div><div className="admin-grid" id="overview">{rows.map(([name, description, count]) => <article key={name}><span>{count}</span><h2>{name}</h2><p>{description}</p></article>)}</div><LanguageVisibilityControl /><section className="admin-note" id="inquiries"><p className="kicker dark">PRIORITY QUEUE</p><h2>우선 처리 목록</h2><div className="admin-row"><strong>신규 문의</strong><span>Supabase 연결 후 담당자, 상태, 메모를 관리합니다.</span></div><div className="admin-row" id="resources"><strong>자료 검토</strong><span>공개 전 국문·영문 번역과 파일 정보를 확인합니다.</span></div><div className="admin-row" id="ai"><strong>AI 고객센터</strong><span>상담 이력과 엔지니어 이관 요청을 관리합니다.</span></div></section><section className="admin-note" id="content"><h2>운영 원칙</h2><p>공개 문구는 짧고 정확하게 작성합니다. 기술 수치와 납품 사례는 검증된 정보만 발행합니다.</p></section></section></main>;
}
