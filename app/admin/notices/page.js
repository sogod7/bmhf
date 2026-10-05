import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import NoticeManager from './NoticeManager';
import { initialNotices } from '../../../lib/notices';
import './notices.css';

export default async function AdminNoticesPage() { if (!await hasAdminSession()) redirect('/admin/login?next=/admin/notices'); return <NoticeManager initialNotices={initialNotices} />; }
