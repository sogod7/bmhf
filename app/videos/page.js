import Link from 'next/link';
import { connection } from 'next/server';
import { listPublicVideos, videoThumbnail } from '../../lib/videos-server';
import VideoPlayer from '../VideoPlayer';
import './videos.css';

export const metadata = {
  title: '영상자료실 | 고주파 열처리·브레이징 장비 구동 영상',
  description: '백마고주파의 고주파 열처리, 템퍼링, 브레이징, 유도가열 시스템 실제 구동 및 공정 영상을 확인하세요.',
  keywords: ['고주파 영상', '열처리 영상', '브레이징 가열 영상', '백마고주파 영상자료실'],
  alternates: {
    canonical: '/videos',
  },
  openGraph: {
    title: '영상자료실 | 백마고주파 (BMHF)',
    description: '고주파 열처리·템퍼링 장비의 실제 적용 사례와 구동 영상을 확인하세요.',
    url: '/videos',
  },
};

export default async function VideosPage() {
  await connection();
  const videos = await listPublicVideos().catch(() => []);
  return <main className="videos-page"><header className="nav"><Link href="/index.html" className="brand">BMHF</Link><nav><a href="/index.html">국문 사이트</a><Link href="/support">AI 고객센터</Link></nav></header><section className="videos-head"><p>BMHF VIDEO LIBRARY</p><h1>제품과 공정을 영상으로 확인하세요.</h1><span>고주파 열처리·템퍼링 장비의 적용 사례입니다.</span></section><section className="video-grid">{videos.map((video) => <article key={video.id}><VideoPlayer className="video-thumb" videoUrl={video.video_url} thumbnail={videoThumbnail(video)} title={video.title} /><h2>{video.title}</h2><p>현재 페이지에서 영상 재생</p></article>)}</section></main>;
}
