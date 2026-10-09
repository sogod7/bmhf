import { adminRoute } from '../../../../../lib/admin-api';
import { formatDateTime, inquiryStatusLabel } from '../../../../../lib/admin-constants';
import { listInquiries } from '../../../../../lib/inquiries';
import { logActivity } from '../../../../../lib/site-settings';

// Neutralize spreadsheet formulas and quote every cell.
const cell = (value) => { let text = String(value ?? ''); if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };

export const GET = adminRoute(async (request) => {
  const status = new URL(request.url).searchParams.get('status');
  const rows = (await listInquiries()).filter((row) => !status || status === 'all' || row.status === status);
  const header = ['접수일시', '상태', '회사명', '담당자', '연락처', '이메일', '문의분야', '문의제품', '문의내용', '첨부파일 수', '관리자 메모'];
  const lines = rows.map((row) => [formatDateTime(row.created_at), inquiryStatusLabel(row.status), row.company_name, row.contact_name, row.phone, row.email, row.category, row.product_title, row.message, row.files?.length || 0, row.admin_memo].map(cell).join(','));
  await logActivity('inquiry.export', `문의 ${rows.length}건 CSV 내보내기`);
  const date = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  return new Response(`﻿${[header.map(cell).join(','), ...lines].join('\r\n')}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="bmhf-inquiries-${date}.csv"`, 'Cache-Control': 'no-store' } });
});
