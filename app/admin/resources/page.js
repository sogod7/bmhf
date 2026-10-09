import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { listResources } from '../../../lib/resources';
import AdminShell from '../AdminShell';
import ResourceManager from './ResourceManager';

export const metadata = { title: '기술자료 관리' };

export default async function AdminResourcesPage() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/resources');
  const resources = await listResources().catch(() => []);
  return <AdminShell active="resources" kicker="TECHNICAL RESOURCES" title="기술자료" description="카탈로그와 사양서 파일을 올리고 자료실(/en/resources) 노출을 관리합니다. 파일은 최대 50MB입니다.">
    <ResourceManager initialResources={resources} />
  </AdminShell>;
}
