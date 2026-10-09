import Link from 'next/link';
import { productGroups, productImage } from '../../lib/products';
import './products.css';
import './catalog.css';

export const metadata = {
  title: '제품소개 | 고주파 열처리·브레이징·유도가열기 시스템',
  description: '열처리, 브레이징, 가열기 등 제품 형상과 생산 조건에 최적화된 백마고주파의 고주파 장비 시스템 카탈로그입니다.',
  keywords: ['고주파 장비', '고주파 열처리 기계', '고주파 브레이징 기계', '유도가열기', '백마고주파 제품', '고주파 카탈로그'],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: '제품소개 | 백마고주파 (BMHF) - 고주파 설비 시스템',
    description: '열처리, 브레이징, 가열기 제품군을 바탕으로 전원·코일·냉각·지그·자동화를 통합 설계합니다.',
    url: '/products',
  },
};

import ProductCatalogViewer from './ProductCatalogViewer';

export default function ProductsPage() {
  const imageMap = {};
  for (const group of productGroups) {
    for (const [slug] of group.items) {
      imageMap[slug] = productImage(slug, group.hero);
    }
  }

  return (
    <main className="products-page">
      <section className="catalog-hero">
        <div>
          <p>BMHF PRODUCT SYSTEMS</p>
          <h1>제품 형상·생산 조건 맞춤형<br />고주파 장비 시스템</h1>
          <span>열처리, 브레이징, 가열기 제품군을 바탕으로 전원·코일·냉각·지그·자동화를 통합 설계합니다.</span>
          <a href="#catalog-content">설비 검색 및 카탈로그 보기</a>
        </div>
      </section>

      <section className="catalog-main" id="catalog-content">
        <h2 className="catalog-family-title">고주파 설비 라인업</h2>
        <ProductCatalogViewer productGroups={productGroups} productImageFn={imageMap} />
      </section>
    </main>
  );
}
