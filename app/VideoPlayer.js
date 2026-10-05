'use client';

import { useRef, useState } from 'react';
import './video-player.css';

function youtubeId(url) { try { return new URL(url).searchParams.get('v'); } catch { return null; } }

export default function VideoPlayer({ videoUrl, title, thumbnail, className = '', label = '영상 재생' }) {
  const [open, setOpen] = useState(false); const player = useRef(null); const id = youtubeId(videoUrl);
  const close = () => { if (document.fullscreenElement) document.exitFullscreen?.(); setOpen(false); };
  const toggleFullscreen = () => { if (!document.fullscreenElement) player.current?.requestFullscreen?.(); else document.exitFullscreen?.(); };
  return <><button type="button" className={`bmhf-video-launch ${className}`} onClick={() => setOpen(true)} aria-label={`${title} ${label}`}><img src={thumbnail} alt={`${title} 영상 미리보기`} /><i>▶</i><b>{label}</b></button>{open && <div className="bmhf-video-modal" role="dialog" aria-modal="true" aria-label={`${title} 영상`}><div className="bmhf-video-player" ref={player}><div className="bmhf-video-toolbar"><strong>{title}</strong><div><button type="button" onClick={toggleFullscreen}>{typeof document !== 'undefined' && document.fullscreenElement ? '전체화면 해제' : '전체화면'}</button><button type="button" onClick={close}>닫기</button></div></div>{id ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen /> : <a href={videoUrl}>영상 열기</a>}</div></div>}</>;
}
