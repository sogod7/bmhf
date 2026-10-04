import Link from 'next/link';
import { productGroups, productImage } from '../../lib/products';
import './products.css';

export const metadata = { title: '제품소개 | BMHF' };

export default function ProductsPage() {
  return <main className="products-page"><section className="products-hero"><div><p>BMHF PRODUCT SYSTEMS</p><h1>공정에 맞춘<br />고주파 장비 솔루션</h1><span>열처리, 브레이징, 가열기 제품군을 워크피스와 생산 조건에 맞춰 구성합니다.</span></div></section><section className="product-intro"><div className="product-tabs">{productGroups.map((group, index) => <a key={group.id} href={`#${group.id}`}><b>0{index + 1}</b><strong>{group.label}</strong><span>{group.en}</span></a>)}</div>{productGroups.map((group) => <section className="product-group" id={group.id} key={group.id}><div className="product-group-head"><img src={group.hero} alt="" /><div><p>{group.en}</p><h2>{group.label}</h2><span>{group.description}</span></div></div><div className="product-grid">{group.items.map(([slug, title], index) => <Link key={slug} href={`/products/${group.id}/${slug}`}><img src={productImage(slug, group.hero)} alt="" /><div><b>{String(index + 1).padStart(2, '0')}</b><h3>{title}</h3><span>상세 보기 →</span></div></Link>)}</div></section>)}</section></main>;
}
