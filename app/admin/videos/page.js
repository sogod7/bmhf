import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { videoLibrary } from '../../../lib/video-library';
import VideoManager from './VideoManager';
import './videos.css';

export default async function AdminVideosPage() { if (!await hasAdminSession()) redirect('/admin/login?next=/admin/videos'); return <VideoManager initialVideos={videoLibrary} />; }
