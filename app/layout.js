import './site.css';
import './fonts.css';
import './horse.css';
import './brand.css';
import './language.css';
import './page-loader.css';
import LanguageSwitch from './LanguageSwitch';
import GlobalHeader from './GlobalHeader';
import GlobalAiSupport from './GlobalAiSupport';
import GlobalFooter from './GlobalFooter';
import PageLoader from './PageLoader';
import VisitTracker from './VisitTracker';

export const metadata = {
  metadataBase: new URL('https://bmhf.co.kr'),
  title: {
    default: '백마고주파 (BMHF) | 고주파 열처리·브레이징·유도가열기 시스템 전문 기업',
    template: '%s | 백마고주파 BMHF',
  },
  description: '(주)백마고주파는 부품 형상과 생산 조건에 최적화된 고주파 열처리·템퍼링, 브레이징, 유도가열기, 맞춤 코일 제작 및 자동화 시스템을 제공하는 고주파 시스템 엔지니어링 전문 기업입니다.',
  keywords: [
    '백마고주파',
    'BMHF',
    '고주파 열처리',
    '고주파 템퍼링',
    '고주파 브레이징',
    '유도가열기',
    '고주파 가열기',
    '맞춤 코일 제작',
    '고주파 시스템 엔지니어링',
    '유도가열',
    'Induction Heating',
  ],
  authors: [{ name: '(주)백마고주파', url: 'https://bmhf.co.kr' }],
  creator: '(주)백마고주파',
  publisher: '(주)백마고주파',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    url: 'https://bmhf.co.kr',
    siteName: '(주)백마고주파 - BMHF',
    title: '백마고주파 (BMHF) | 고주파 열처리·브레이징·유도가열기 시스템 전문',
    description: '부품 형상과 생산 조건에 최적화된 고주파 열처리·템퍼링, 브레이징, 유도가열기, 맞춤 코일 제작 및 자동화 시스템 엔지니어링',
    images: [
      {
        url: '/assets/images/hero-induction-production.png',
        width: 1200,
        height: 630,
        alt: '백마고주파 고주파 유도가열 시스템',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '백마고주파 (BMHF) | 고주파 열처리·브레이징·유도가열기 시스템 전문',
    description: '부품 형상과 생산 조건에 최적화된 고주파 열처리·템퍼링, 브레이징, 유도가열기, 맞춤 코일 제작 및 자동화 시스템 엔지니어링',
    images: ['/assets/images/hero-induction-production.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    other: {
      'naver-site-verification': process.env.NAVER_SITE_VERIFICATION || '',
    },
  },
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://bmhf.co.kr/#organization',
  name: '(주)백마고주파',
  alternateName: ['BMHF', '백마고주파', 'Baek-Ma High Frequency'],
  url: 'https://bmhf.co.kr',
  logo: 'https://bmhf.co.kr/assets/images/bmhf-logo-official.png',
  email: 'master@bmhf.co.kr',
  telephone: '+82-31-498-1292',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '경제로 70, 304호',
    addressLocality: '시흥시',
    addressRegion: '경기도',
    postalCode: '15082',
    addressCountry: 'KR',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body>
        <PageLoader />
        <GlobalHeader />
        {children}
        <GlobalFooter />
        <GlobalAiSupport />
        <LanguageSwitch />
        <VisitTracker />
      </body>
    </html>
  );
}
