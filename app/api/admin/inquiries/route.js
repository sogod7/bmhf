import { adminRoute, readJson } from '../../../../lib/admin-api';
import { inquiryStatusLabel } from '../../../../lib/admin-constants';
import { deleteInquiry, listInquiries, updateInquiry } from '../../../../lib/inquiries';
import { logActivity } from '../../../../lib/site-settings';

const MAX_BULK = 200;
const idList = (value) => (Array.isArray(value) ? value : String(value || '').split(',')).map((id) => String(id).trim()).filter(Boolean).slice(0, MAX_BULK);

export const GET = adminRoute(async () => Response.json({ inquiries: await listInquiries() }));

// Single update: { id, status?, adminMemo? }. Bulk status change: { ids: [...], status }.
export const PATCH = adminRoute(async (request) => {
  const { id, ids, status, adminMemo } = await readJson(request);
  if (ids) {
    const targets = idList(ids);
    if (!targets.length || !status) throw new Error('변경할 문의와 상태를 선택하세요.');
    const updated = (await Promise.all(targets.map((target) => updateInquiry(target, { status })))).filter(Boolean);
    await logActivity('inquiry.bulk_update', `문의 ${updated.length}건 상태 → ${inquiryStatusLabel(status)}`);
    return Response.json({ inquiries: updated });
  }
  if (!id) throw new Error('문의 ID가 필요합니다.');
  const inquiry = await updateInquiry(id, { status, adminMemo });
  if (!inquiry) return Response.json({ error: '해당 문의를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('inquiry.update', `${inquiry.company_name} 문의 ${status ? `상태 → ${inquiryStatusLabel(status)}` : '메모 수정'}`);
  return Response.json({ inquiry });
});

// DELETE ?id=one or ?ids=a,b,c
export const DELETE = adminRoute(async (request) => {
  const params = new URL(request.url).searchParams;
  const targets = idList(params.get('ids') || params.get('id'));
  if (!targets.length) throw new Error('삭제할 문의를 선택하세요.');
  const removed = [];
  for (const target of targets) { const row = await deleteInquiry(target); if (row) removed.push(row); }
  if (!removed.length) return Response.json({ error: '해당 문의를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('inquiry.delete', removed.length === 1 ? `${removed[0].company_name} 문의 삭제` : `문의 ${removed.length}건 삭제`);
  return Response.json({ ok: true, deleted: removed.map((row) => row.id) });
});
