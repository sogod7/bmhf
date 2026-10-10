import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { listNotices } from '../../../lib/notices-server';
import { getSettings } from '../../../lib/site-settings';
import AdminShell from '../AdminShell';
import NoticeManager from './NoticeManager';

export const metadata = { title: '공지사항 관리' };

export default async function AdminNoticesPage() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/notices');
  const [notices, settings] = await Promise.all([listNotices().catch(() => []), getSettings()]);
  return <AdminShell active="notices" kicker="NOTICE MANAGEMENT" title="공지사항" description="고정된 공지는 홈페이지와 공지 목록 맨 위에 노출됩니다. 팝업을 켠 공지는 홈페이지 첫 화면에 팝업창으로 뜹니다(최대 5건). 저장 후 1분 이내에 사이트에 반영됩니다.">
    <NoticeManager initialNotices={notices} initialPopupIds={settings.popup_notices || []} />
  </AdminShell>;
}
