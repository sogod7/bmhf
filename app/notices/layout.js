export const metadata = {
  title: '공지사항 | 백마고주파 (BMHF) 뉴스룸',
  description: '백마고주파의 주요 공지사항, 기술 업데이트, 전시회 참가 및 신제품 소식을 전해드립니다.',
  keywords: ['백마고주파 공지사항', 'BMHF 뉴스', '고주파 소식', '백마고주파 업데이트'],
  alternates: {
    canonical: '/notices',
  },
  openGraph: {
    title: '공지사항 | 백마고주파 (BMHF) 뉴스룸',
    description: '백마고주파의 주요 안내와 업데이트를 확인하세요.',
    url: '/notices',
  },
};

export default function NoticesLayout({ children }) {
  return children;
}
