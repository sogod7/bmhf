'use client';

import { useId, useRef, useState } from 'react';

// "?" explanation. Opens on hover, keyboard focus, or tap; the tip is positioned against the
// viewport so scrollable tables and cards never clip it.
export default function Help({ text }) {
  const ref = useRef(null);
  const id = useId();
  const [pos, setPos] = useState(null);
  if (!text) return null;
  const show = () => {
    const box = ref.current.getBoundingClientRect();
    const width = Math.min(260, window.innerWidth - 24);
    const left = Math.min(Math.max(box.left + box.width / 2 - width / 2, 12), window.innerWidth - width - 12);
    const above = box.top > 110;
    setPos({ left, width, top: above ? box.top - 8 : box.bottom + 8, above });
  };
  const hide = () => setPos(null);
  return <span ref={ref} className={`an-help${pos ? ' is-open' : ''}`} tabIndex={0} role="button" aria-label="설명 보기" aria-describedby={pos ? id : undefined}
    onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={(event) => event.key === 'Escape' && hide()}>?
    {pos && <span id={id} role="tooltip" className={`an-tip${pos.above ? ' is-above' : ''}`} style={{ left: pos.left, top: pos.top, width: pos.width }}>{text}</span>}
  </span>;
}
