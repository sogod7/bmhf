'use client';

import { usePathname } from 'next/navigation';
import './global-footer.css';

export default function GlobalFooter() {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return <footer className="global-footer"><div className="global-footer-grid"><div><img src="/assets/images/bmhf-logo-footer-white.png" alt="BMHF 백마고주파" /><p>고주파 열처리, 브레이징, 유도가열기, 코일 설계까지 현장 조건에 맞춘 고주파 시스템을 제안합니다.</p></div><div><h2>바로가기</h2><a href="/products">제품소개</a><a href="/technology.html">보유기술</a><a href="/videos">영상자료</a><a href="/notices">공지사항</a></div><div><h2>회사 정보</h2><p>주식회사 백마고주파</p><p>경기도 시흥시 경제로 70, 304호</p><p>사업자등록번호 140-81-65843</p></div><div><h2>문의</h2><p>전화 031-498-1292~4</p><p>팩스 031-498-1295</p><a className="global-footer-button" href="/contact.html">프로젝트 상담하기</a></div></div><div className="global-footer-bottom"><span>© BEAK-MA HIGH FREQUENCY. All rights reserved.</span><a href="/admin/login">관리자 로그인</a></div></footer>;
}
