import Link from 'next/link';
import { productGroups, productImage } from '../../lib/products';
import './products.css';
import './catalog.css';

export const metadata = { title: '제품소개 | BMHF' };

const tagsByGroup = { 'heat-treatment': ['맞춤 코일', '템퍼링 연계', '자동 이송'], brazing: ['접합 품질 관리', '전용 지그', '다공정 자동화'], heating: ['출력·주파수 선정', '정밀 온도 제어', '안전 인터록'] };

export default function ProductsPage() {
  return <main className="products-page"><section className="catalog-hero"><div><p>BMHF PRODUCT SYSTEMS</p><h1>제품 형상·생산 조건 맞춤형<br />고주파 장비 시스템</h1><span>열처리, 브레이징, 가열기 제품군을 바탕으로 전원·코일·냉각·지그·자동화를 통합 설계합니다.</span><a href="#heat-treatment">제품군 살펴보기</a></div></section><section className="catalog-main"><h2 className="catalog-family-title">제품군</h2><nav className="catalog-tabs" aria-label="제품군 바로가기">{productGroups.map((group, index) => <a key={group.id} href={`#${group.id}`}><b>0{index + 1}</b><strong>{group.label}</strong><span>{group.en}</span></a>)}</nav>{productGroups.map((group) => <section className="catalog-group" id={group.id} key={group.id}><header><div><p>{group.en.toUpperCase()}</p><h2>{group.label} 제품군</h2></div><span>{group.description}</span></header><div className="catalog-list">{group.items.map(([slug, title], index) => <Link className="catalog-card" key={slug} href={`/products/${group.id}/${slug}`}><figure><img src={productImage(slug, group.hero)} alt="" /><b>{String(index + 1).padStart(2, '0')}</b></figure><div><p>{group.en.toUpperCase()} SYSTEM · {String(index + 1).padStart(2, '0')}</p><h3>{title}</h3><span>워크피스 형상, 목표 품질, 생산량을 기준으로 시스템 사양을 검토합니다.</span><ul>{tagsByGroup[group.id].map((tag) => <li key={tag}>{tag}</li>)}</ul><em>제품 상세 보기 →</em></div></Link>)}</div></section>)}</section></main>;
}
