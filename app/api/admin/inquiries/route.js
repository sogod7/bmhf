import { adminRoute, readJson } from '../../../../lib/admin-api';
import { inquiryStatusLabel } from '../../../../lib/admin-constants';
import { deleteInquiry, listInquiries, updateInquiry } from '../../../../lib/inquiries';
import { logActivity } from '../../../../lib/site-settings';

export const GET = adminRoute(async () => Response.json({ inquiries: await listInquiries() }));

export const PATCH = adminRoute(async (request) => {
  const { id, status, adminMemo } = await readJson(request);
  if (!id) throw new Error('문의 ID가 필요합니다.');
  const inquiry = await updateInquiry(id, { status, adminMemo });
  if (!inquiry) return Response.json({ error: '해당 문의를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('inquiry.update', `${inquiry.company_name} 문의 ${status ? `상태 → ${inquiryStatusLabel(status)}` : '메모 수정'}`);
  return Response.json({ inquiry });
});

export const DELETE = adminRoute(async (request) => {
  const id = new URL(request.url).searchParams.get('id');
  const removed = id && await deleteInquiry(id);
  if (!removed) return Response.json({ error: '해당 문의를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('inquiry.delete', `${removed.company_name} 문의 삭제`);
  return Response.json({ ok: true });
});
