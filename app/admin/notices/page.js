import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { listNotices } from '../../../lib/notices-server';
import AdminShell from '../AdminShell';
import NoticeManager from './NoticeManager';

export const metadata = { title: '공지사항 관리' };

export default async function AdminNoticesPage() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/notices');
  const notices = await listNotices().catch(() => []);
  return <AdminShell active="notices" kicker="NOTICE MANAGEMENT" title="공지사항" description="고정된 공지는 홈페이지와 공지 목록 맨 위에 노출됩니다. 저장 즉시 사이트에 반영됩니다.">
    <NoticeManager initialNotices={notices} />
  </AdminShell>;
}
