'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Admin charts (single y-axis). type 'line': area + line, with an optional dashed comparison
// series (previous period). type 'bar': one bar per point. Hover, touch or arrow keys show a tooltip.
// Colors validated with the dataviz palette checker: #2f73dc (current) / #b7791f (previous).
const CURRENT = '#2f73dc';
const COMPARE = '#b7791f';
const PAD = { top: 14, right: 12, bottom: 26, left: 40 };

function niceMax(value) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  const unit = [1, 2, 2.5, 5, 10].map((multiple) => multiple * step).find((size) => size * 4 >= value);
  return unit * 4;
}
const fmt = (value) => Math.round(value).toLocaleString('ko-KR');

/**
 * points: [{ label, value, compare?, details?: [[name, value]] }]
 * seriesName / compareName: legend + tooltip names; unit: '명' | '건' | ''
 */
export default function AdminChart({ points, type = 'line', seriesName, compareName, unit = '', height = 220, ariaLabel }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(null);
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hasCompare = type === 'line' && points.some((point) => point.compare != null);
  const max = niceMax(Math.max(1, ...points.map((point) => Math.max(point.value, hasCompare ? point.compare || 0 : 0))));
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const count = points.length;
  const band = count ? innerW / count : 0;
  const xOf = (index) => PAD.left + (type === 'bar' ? band * index + band / 2 : count > 1 ? (innerW * index) / (count - 1) : innerW / 2);
  const yOf = (value) => PAD.top + innerH - (value / max) * innerH;
  const ticks = [0, 1, 2, 3, 4].map((step) => (max / 4) * step);
  const labelEvery = Math.max(1, Math.ceil(count / Math.max(2, Math.floor(innerW / 46))));

  const linePath = (key) => points.map((point, index) => `${index ? 'L' : 'M'}${xOf(index).toFixed(1)},${yOf(point[key] || 0).toFixed(1)}`).join('');
  const areaPath = count ? `${linePath('value')}L${xOf(count - 1).toFixed(1)},${yOf(0)}L${xOf(0).toFixed(1)},${yOf(0)}Z` : '';

  const pick = (clientX) => {
    const box = wrapRef.current.getBoundingClientRect();
    const x = clientX - box.left - PAD.left;
    const index = type === 'bar' ? Math.floor(x / band) : Math.round((x / innerW) * (count - 1));
    setActive(Math.min(count - 1, Math.max(0, index)));
  };
  const onKey = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') { setActive(null); return; }
    setActive((current) => {
      if (event.key === 'Home') return 0;
      if (event.key === 'End') return count - 1;
      const start = current ?? (event.key === 'ArrowLeft' ? count : -1);
      return Math.min(count - 1, Math.max(0, start + (event.key === 'ArrowRight' ? 1 : -1)));
    });
  };

  const point = active != null ? points[active] : null;
  const tipLeft = point ? Math.min(Math.max(xOf(active), 70), width - 70) : 0;
  const total = points.reduce((sum, item) => sum + item.value, 0);

  return <figure className="acx">
    {(hasCompare || seriesName) && <figcaption className="acx-legend">
      <span><i style={{ background: CURRENT }} />{seriesName}</span>
      {hasCompare && <span><i className="is-dashed" style={{ borderColor: COMPARE }} />{compareName}</span>}
    </figcaption>}
    <div ref={wrapRef} className="acx-plot" style={{ height }} tabIndex={0} role="img" aria-label={`${ariaLabel || seriesName} · 합계 ${fmt(total)}${unit}. 좌우 화살표로 값을 확인할 수 있습니다.`}
      onPointerMove={(event) => count && pick(event.clientX)} onPointerDown={(event) => count && pick(event.clientX)} onPointerLeave={(event) => event.pointerType === 'mouse' && setActive(null)}
      onKeyDown={onKey} onBlur={() => setActive(null)}>
      {width > 0 && <svg width={width} height={height} aria-hidden="true">
        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={CURRENT} stopOpacity=".2" /><stop offset="100%" stopColor={CURRENT} stopOpacity="0" /></linearGradient></defs>
        {ticks.map((tick) => <g key={tick}>
          <line x1={PAD.left} x2={width - PAD.right} y1={yOf(tick)} y2={yOf(tick)} className={tick ? 'acx-grid' : 'acx-base'} />
          <text x={PAD.left - 8} y={yOf(tick)} className="acx-tick" textAnchor="end" dominantBaseline="middle">{fmt(tick)}</text>
        </g>)}
        {points.map((item, index) => (index % labelEvery === 0 || index === count - 1) && <text key={item.label} x={xOf(index)} y={height - 8} className="acx-tick" textAnchor="middle">{item.label}</text>)}
        {type === 'bar' ? points.map((item, index) => {
          const barW = Math.max(2, Math.min(28, band - 4));
          const y = yOf(item.value);
          return <rect key={item.label} x={xOf(index) - barW / 2} y={y} width={barW} height={Math.max(0, yOf(0) - y)} rx={Math.min(4, barW / 2)} className={`acx-bar${active === index ? ' is-active' : ''}`} style={{ fill: CURRENT }} />;
        }) : <>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          {hasCompare && <path d={linePath('compare')} fill="none" stroke={COMPARE} strokeWidth="1.75" strokeDasharray="5 4" strokeLinejoin="round" />}
          <path d={linePath('value')} fill="none" stroke={CURRENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {count <= 31 && points.map((item, index) => <circle key={item.label} cx={xOf(index)} cy={yOf(item.value)} r="2.5" fill="#fff" stroke={CURRENT} strokeWidth="1.5" />)}
        </>}
        {point && <g className="acx-focus">
          <line x1={xOf(active)} x2={xOf(active)} y1={PAD.top} y2={yOf(0)} />
          {type === 'line' && hasCompare && point.compare != null && <circle cx={xOf(active)} cy={yOf(point.compare)} r="4.5" fill={COMPARE} stroke="#fff" strokeWidth="2" />}
          {type === 'line' && <circle cx={xOf(active)} cy={yOf(point.value)} r="5" fill={CURRENT} stroke="#fff" strokeWidth="2" />}
        </g>}
      </svg>}
      {point && <div className="acx-tip" style={{ left: tipLeft }} role="status">
        <strong>{point.title || point.label}</strong>
        <span><i style={{ background: CURRENT }} />{seriesName}<b>{fmt(point.value)}{unit}</b></span>
        {hasCompare && point.compare != null && <span><i className="is-dashed" style={{ borderColor: COMPARE }} />{compareName}<b>{fmt(point.compare)}{unit}</b></span>}
        {point.details?.map(([name, value]) => <span key={name} className="is-detail">{name}<b>{value}</b></span>)}
      </div>}
    </div>
  </figure>;
}
