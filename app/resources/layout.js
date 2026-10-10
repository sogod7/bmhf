export const metadata = {
  title: '기술 자료실 | 백마고주파 (BMHF) 카탈로그·사양서 다운로드',
  description: '백마고주파 고주파 열처리, 브레이징, 유도가열기 카탈로그와 기술 사양서, 회사 소개서를 내려받으세요.',
  keywords: ['백마고주파 카탈로그', 'BMHF 자료실', '고주파 열처리 사양서', '유도가열기 카탈로그'],
  alternates: {
    canonical: '/resources',
    languages: { 'ko-KR': '/resources', 'en-US': '/en/resources' },
  },
  openGraph: {
    title: '기술 자료실 | 백마고주파 (BMHF)',
    description: '카탈로그, 기술 사양서, 회사 소개서를 내려받으세요.',
    url: '/resources',
  },
};

export default function ResourcesLayout({ children }) {
  return children;
}
