import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { listVideos } from '../../../lib/videos-server';
import AdminShell from '../AdminShell';
import VideoManager from './VideoManager';

export const metadata = { title: '영상 관리' };

export default async function AdminVideosPage() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/videos');
  const videos = await listVideos().catch(() => []);
  return <AdminShell active="videos" kicker="VIDEO LIBRARY" title="영상 관리" description="유튜브 영상 주소를 등록하면 영상자료실에 바로 노출됩니다. 썸네일을 비워 두면 유튜브 썸네일을 사용합니다.">
    <VideoManager initialVideos={videos} />
  </AdminShell>;
}
