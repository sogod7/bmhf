'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const tagsByGroup = {
  'heat-treatment': ['맞춤 코일', '템퍼링 연계', '자동 이송'],
  brazing: ['접합 품질 관리', '전용 지그', '다공정 자동화'],
  heating: ['출력·주파수 선정', '정밀 온도 제어', '안전 인터록'],
};

export default function ProductCatalogViewer({ productGroups, productImageFn }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('all');

  // Flatten all products
  const allItems = useMemo(() => {
    const list = [];
    for (const group of productGroups) {
      group.items.forEach(([slug, title], index) => {
        let industries = [];
        if (group.id === 'heat-treatment') {
          industries = ['automotive', 'machinery'];
        } else if (group.id === 'brazing') {
          industries = ['tools', 'machinery'];
        } else if (group.id === 'heating') {
          industries = slug.includes('motor') ? ['motor', 'automotive'] : ['machinery', 'electronics'];
        }

        list.push({
          groupId: group.id,
          groupLabel: group.label,
          groupEn: group.en,
          groupHero: group.hero,
          slug,
          title,
          index: index + 1,
          industries,
          tags: tagsByGroup[group.id] || [],
          image: productImageFn[slug] || group.hero,
        });
      });
    }
    return list;
  }, [productGroups, productImageFn]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Industry filter
      if (activeIndustry !== 'all') {
        if (activeIndustry === 'heat-treatment' && item.groupId !== 'heat-treatment') return false;
        if (activeIndustry === 'brazing' && item.groupId !== 'brazing') return false;
        if (activeIndustry === 'heating' && item.groupId !== 'heating') return false;
        if (activeIndustry === 'automotive' && !item.industries.includes('automotive')) return false;
        if (activeIndustry === 'tools' && !item.industries.includes('tools')) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchGroup = item.groupLabel.toLowerCase().includes(query) || item.groupEn.toLowerCase().includes(query);
        const matchSlug = item.slug.toLowerCase().includes(query);
        const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchTitle || matchGroup || matchSlug || matchTags;
      }

      return true;
    });
  }, [allItems, activeIndustry, searchTerm]);

  const isFiltering = searchTerm.trim().length > 0 || activeIndustry !== 'all';

  return (
    <div className="product-search-filter-wrap">
      {/* Search and Filter Control Bar */}
      <div className="catalog-filter-bar" style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        marginBottom: '36px',
        border: '1px solid #e5e9f2'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Instant Search Input */}
          <div style={{ flex: '1 1 320px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8898aa', fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="설비명, 워크피스, 공정 검색 (예: 샤프트, 초경, 모터케이스, 압입...)"
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: '8px',
                border: '1.5px solid #d1d9e6',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f8fafc'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Result Counter & Clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#4a5568' }}>
              검색 설비: <strong>{filteredItems.length}</strong>대 / 총 {allItems.length}대
            </span>
            {isFiltering && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setActiveIndustry('all'); }}
                style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
          {[
            { id: 'all', label: '전체 보기' },
            { id: 'heat-treatment', label: '고주파 열처리 (8)' },
            { id: 'brazing', label: '고주파 브레이징 (6)' },
            { id: 'heating', label: '고주파 가열기 (15)' },
            { id: 'automotive', label: '자동차·기계 샤프트류' },
            { id: 'tools', label: '절삭공구·PCD 접합' },
          ].map((chip) => {
            const isActive = activeIndustry === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveIndustry(chip.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '600' : '400',
                  border: isActive ? '1.5px solid #0056b3' : '1px solid #e2e8f0',
                  backgroundColor: isActive ? '#0056b3' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Results View */}
      {isFiltering ? (
        <section className="catalog-group" style={{ marginBottom: '40px' }}>
          <header style={{ marginBottom: '24px' }}>
            <div>
              <p>SEARCH RESULTS</p>
              <h2>필터 검색 결과 ({filteredItems.length}건)</h2>
            </div>
            {searchTerm && <span>&ldquo;{searchTerm}&rdquo; 검색어와 일치하는 고주파 설비입니다.</span>}
          </header>

          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1'
            }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                조건에 맞는 설비를 찾지 못하셨나요?
              </p>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                백마고주파는 고객사의 워크피스 도면과 생산 조건에 맞춘 특수 맞춤 설비도 직접 설계·제작합니다.
              </p>
              <Link
                href={`/contact.html?message=${encodeURIComponent(`[맞춤 설비 문의] ${searchTerm} 관련 고주파 시스템 검토 요청`)}`}
                className="btn btn-primary"
                style={{ display: 'inline-block', padding: '10px 24px' }}
              >
                맞춤형 시스템 상담 신청하기 →
              </Link>
            </div>
          ) : (
            <div className="catalog-list">
              {filteredItems.map((item) => (
                <Link
                  className="catalog-card"
                  key={`${item.groupId}-${item.slug}`}
                  href={`/products/${item.groupId}/${item.slug}`}
                >
                  <figure>
                    <img src={item.image} alt={item.title} />
                    <b>{String(item.index).padStart(2, '0')}</b>
                  </figure>
                  <div>
                    <p>{item.groupEn.toUpperCase()} · {item.groupLabel}</p>
                    <h3>{item.title}</h3>
                    <span>워크피스 형상, 목표 품질, 생산량을 기준으로 시스템 사양을 검토합니다.</span>
                    <ul>
                      {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                    <em>제품 상세 및 견적 문의 →</em>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Default Categorized View */
        productGroups.map((group) => (
          <section className="catalog-group" id={group.id} key={group.id}>
            <header>
              <div>
                <p>{group.en.toUpperCase()}</p>
                <h2>{group.label} 제품군</h2>
              </div>
              <span>{group.description}</span>
            </header>
            <div className="catalog-list">
              {group.items.map(([slug, title], index) => (
                <Link className="catalog-card" key={slug} href={`/products/${group.id}/${slug}`}>
                  <figure>
                    <img src={productImageFn[slug] || group.hero} alt={title} />
                    <b>{String(index + 1).padStart(2, '0')}</b>
                  </figure>
                  <div>
                    <p>{group.en.toUpperCase()} SYSTEM · {String(index + 1).padStart(2, '0')}</p>
                    <h3>{title}</h3>
                    <span>워크피스 형상, 목표 품질, 생산량을 기준으로 시스템 사양을 검토합니다.</span>
                    <ul>
                      {(tagsByGroup[group.id] || []).map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                    <em>제품 상세 보기 →</em>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
