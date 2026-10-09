import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findProduct, productImage } from '../../../../lib/products';
import { videoLibrary } from '../../../../lib/video-library';
import CamShaftDetailGallery from './CamShaftDetailGallery';
import VideoPlayer from '../../../VideoPlayer';
import '../../products.css';
import './detail.css';

export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  const product = findProduct(category, slug);
  if (!product) return {};

  const { group, title } = product;
  const image = productImage(slug, group.hero);
  const pageTitle = `${title} | 백마고주파 제품소개`;
  const pageDesc = `${title} - ${group.label} 제품군. ${group.description} 워크피스 형상과 생산 조건에 맞춘 백마고주파 고주파 시스템.`;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [title, group.label, '고주파 시스템', '유도가열', '백마고주파'],
    alternates: {
      canonical: `/products/${category}/${slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `/products/${category}/${slug}`,
      images: [
        {
          url: image,
          alt: `${title} 고주파 설비`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [image],
    },
  };
}

export default async function ProductDetail({ params }) {
  const { category, slug } = await params;
  const product = findProduct(category, slug);
  if (!product) notFound();
  const { group, title } = product;
  const image = productImage(slug, group.hero);
  const video = videoLibrary.find((item) => item.id === slug && item.visible);
  const detailImages = slug === 'cam-shaft' ? Array.from({ length: 7 }, (_, index) => `/assets/images/products/cam-shaft/cam-shaft-detail-${String(index + 1).padStart(2, '0')}.png`) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://bmhf.co.kr/' },
          { '@type': 'ListItem', position: 2, name: '제품소개', item: 'https://bmhf.co.kr/products' },
          { '@type': 'ListItem', position: 3, name: group.label, item: `https://bmhf.co.kr/products#${group.id}` },
          { '@type': 'ListItem', position: 4, name: title, item: `https://bmhf.co.kr/products/${category}/${slug}` }
        ]
      },
      {
        '@type': 'Product',
        name: title,
        image: `https://bmhf.co.kr${image}`,
        description: `${title} - ${group.label} 제품군. ${group.description}`,
        category: group.label,
        brand: {
          '@type': 'Brand',
          name: '(주)백마고주파'
        },
        manufacturer: {
          '@type': 'Organization',
          name: '(주)백마고주파',
          url: 'https://bmhf.co.kr'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="product-detail"><section className="detail-hero"><img src={image} alt="" /><div><p><Link href="/products">제품소개</Link> / <Link href={`/products#${group.id}`}>{group.label}</Link></p><h1>{title}</h1><span>{group.description}</span><Link href={`/contact.html?category=${category}&product=${slug}&title=${encodeURIComponent(title)}`}>프로젝트 상담하기</Link></div></section><section className="detail-body"><img className="detail-product-image" src={image} alt={`${title} 설비`} />{detailImages.length > 0 && <CamShaftDetailGallery images={detailImages} />}<div><p className="detail-kicker">SYSTEM OVERVIEW</p><h2>워크피스와 생산 조건을 기준으로 설계합니다.</h2><p>표시된 구성은 제품군의 기술적 예시입니다. 실제 출력, 주파수, 코일, 냉각, 지그 및 자동화 사양은 재질·형상·생산량을 검토한 뒤 결정됩니다.</p></div><dl><div><dt>공정 구성</dt><dd>전원 · 매칭 · 코일 · 냉각 · 제어</dd></div><div><dt>검토 항목</dt><dd>재질 · 형상 · 목표 품질 · 생산량</dd></div><div><dt>상담 방식</dt><dd>도면 또는 샘플 기반 기술 검토</dd></div></dl></section>{video && <section className="product-video"><div><p>BMHF PRODUCT VIDEO</p><h2>{title} 영상자료</h2><span>제품 및 공정 구성을 영상으로 확인하세요.</span></div><VideoPlayer className="video-frame" videoUrl={video.videoUrl} thumbnail={video.thumbnail} title={title} /></section>}</main>
    </>
  );
}
