'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { youtubeId } from '../lib/admin-constants';
import './video-player.css';

const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

export default function VideoPlayer({ videoUrl, title, thumbnail, className = '', label = '영상 재생' }) {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const player = useRef(null); const launcher = useRef(null); const closeButton = useRef(null);
  const id = youtubeId(videoUrl);

  const exitFullscreen = useCallback(() => {
    if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    try { screen.orientation?.unlock?.(); } catch {}
    setPseudoFullscreen(false);
  }, []);
  const close = useCallback(() => { exitFullscreen(); setOpen(false); }, [exitFullscreen]);

  async function toggleFullscreen() {
    if (fullscreen || pseudoFullscreen) { exitFullscreen(); return; }
    const element = player.current;
    const request = element?.requestFullscreen || element?.webkitRequestFullscreen;
    try {
      if (!request) throw new Error('unsupported');
      await request.call(element);
      await screen.orientation?.lock?.('landscape').catch(() => {});
    } catch {
      // iPhone Safari cannot fullscreen a non-video element: fill the viewport instead.
      setPseudoFullscreen(true);
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    const sync = () => setFullscreen(Boolean(fullscreenElement()));
    const onKey = (event) => { if (event.key === 'Escape' && !fullscreenElement()) close(); };
    const previousOverflow = document.body.style.overflow;
    const opener = launcher.current;
    document.body.style.overflow = 'hidden';
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    document.addEventListener('keydown', onKey);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
      document.removeEventListener('keydown', onKey);
      setFullscreen(false);
      opener?.focus();
    };
  }, [open, close]);

  const expanded = fullscreen || pseudoFullscreen;
  const modal = open && <div className={`bmhf-video-modal${pseudoFullscreen ? ' is-pseudo-fullscreen' : ''}`} role="dialog" aria-modal="true" aria-label={`${title} 영상`} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="bmhf-video-player" ref={player}>
      <div className="bmhf-video-toolbar">
        <strong>{title}</strong>
        <div>
          <button type="button" onClick={toggleFullscreen} aria-pressed={expanded}><span aria-hidden="true">{expanded ? '⤡' : '⤢'}</span>{expanded ? '전체화면 해제' : '전체화면'}</button>
          <button type="button" ref={closeButton} onClick={close} className="is-close"><span aria-hidden="true">✕</span>닫기</button>
        </div>
      </div>
      <div className="bmhf-video-frame">{id ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" allowFullScreen /> : <a href={videoUrl} target="_blank" rel="noreferrer">영상 열기</a>}</div>
    </div>
    {!expanded && <p className="bmhf-video-hint">화면 밖을 누르거나 닫기 버튼으로 돌아갑니다.</p>}
  </div>;

  return <>
    <button type="button" ref={launcher} className={`bmhf-video-launch ${className}`} onClick={() => setOpen(true)} aria-label={`${title} ${label}`}><img src={thumbnail} alt={`${title} 영상 미리보기`} /><i>▶</i><b>{label}</b></button>
    {modal && createPortal(modal, document.body)}
  </>;
}
