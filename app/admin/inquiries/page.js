import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { listInquiries } from '../../../lib/inquiries';
import AdminShell from '../AdminShell';
import InquiriesManager from './InquiriesManager';

export const metadata = { title: '문의 관리' };

export default async function AdminInquiriesPage() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/inquiries');
  const inquiries = await listInquiries().catch(() => []);
  return <AdminShell active="inquiries" kicker="INQUIRY MANAGEMENT" title="문의 관리" description="웹사이트로 접수된 견적·기술상담 문의를 확인하고 처리 상태를 관리합니다.">
    <InquiriesManager initialInquiries={inquiries} />
  </AdminShell>;
}
