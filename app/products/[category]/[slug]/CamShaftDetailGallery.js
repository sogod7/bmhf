'use client';

import { useState } from 'react';

export default function CamShaftDetailGallery({ images }) {
  const [active, setActive] = useState(null);
  const close = () => setActive(null);
  return <><section className="detail-thumbnail-gallery" aria-label="CAM SHAFT 템퍼링 세부 구성"><p>세부 구성</p><div>{images.map((src, index) => <button type="button" key={src} onClick={() => setActive(index)} aria-label={`세부 구성 사진 ${index + 1} 크게 보기`}><img src={src} alt={`CAM SHAFT 템퍼링 세부 구성 ${index + 1}`} loading="lazy" /></button>)}</div></section>{active !== null && <div className="detail-image-modal" role="dialog" aria-modal="true" aria-label="세부 구성 사진 크게 보기" onClick={close}><button className="detail-modal-close" type="button" onClick={close} aria-label="닫기">×</button><button className="detail-modal-nav previous" type="button" onClick={(event) => { event.stopPropagation(); setActive((active + images.length - 1) % images.length); }} aria-label="이전 사진">‹</button><img src={images[active]} alt={`CAM SHAFT 템퍼링 세부 구성 ${active + 1}`} onClick={(event) => event.stopPropagation()} /><button className="detail-modal-nav next" type="button" onClick={(event) => { event.stopPropagation(); setActive((active + 1) % images.length); }} aria-label="다음 사진">›</button><span>{active + 1} / {images.length}</span></div>}</>;
}
