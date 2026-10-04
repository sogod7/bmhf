import Link from 'next/link';
import { videoLibrary } from '../../lib/video-library';
import './videos.css';

export const metadata = { title: '영상자료 | 백마고주파' };

export default function VideosPage() {
  return <main className="videos-page"><header className="nav"><Link href="/index.html" className="brand">BMHF</Link><nav><a href="/index.html">국문 사이트</a><Link href="/support">AI 고객센터</Link></nav></header><section className="videos-head"><p>BMHF VIDEO LIBRARY</p><h1>제품과 공정을 영상으로 확인하세요.</h1><span>고주파 열처리·템퍼링 장비의 적용 사례입니다.</span></section><section className="video-grid">{videoLibrary.filter((video) => video.visible).map((video) => <article key={video.id}><a href={video.videoUrl} target="_blank" rel="noreferrer" aria-label={`${video.title} 영상 열기`}><div className="video-thumb"><img src={video.thumbnail} alt="" /><i>▶</i></div><h2>{video.title}</h2><p>YouTube에서 영상 보기</p></a></article>)}</section></main>;
}
