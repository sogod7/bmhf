import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findProduct, productImage } from '../../../../lib/products';
import '../../products.css';
import './detail.css';

export default async function ProductDetail({ params }) {
  const { category, slug } = await params;
  const product = findProduct(category, slug);
  if (!product) notFound();
  const { group, title } = product;
  const image = productImage(slug, group.hero);
  return <main className="product-detail"><section className="detail-hero"><img src={image} alt="" /><div><p><Link href="/products">제품소개</Link> / <Link href={`/products#${group.id}`}>{group.label}</Link></p><h1>{title}</h1><span>{group.description}</span><a href="/contact.html">프로젝트 상담하기</a></div></section><section className="detail-body"><img className="detail-product-image" src={image} alt={`${title} 설비`} /><div><p className="detail-kicker">SYSTEM OVERVIEW</p><h2>워크피스와 생산 조건을 기준으로 설계합니다.</h2><p>표시된 구성은 제품군의 기술적 예시입니다. 실제 출력, 주파수, 코일, 냉각, 지그 및 자동화 사양은 재질·형상·생산량을 검토한 뒤 결정됩니다.</p></div><dl><div><dt>공정 구성</dt><dd>전원 · 매칭 · 코일 · 냉각 · 제어</dd></div><div><dt>검토 항목</dt><dd>재질 · 형상 · 목표 품질 · 생산량</dd></div><div><dt>상담 방식</dt><dd>도면 또는 샘플 기반 기술 검토</dd></div></dl></section></main>;
}
