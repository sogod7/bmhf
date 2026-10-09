import { adminRoute, readJson } from '../../../../lib/admin-api';
import { createNotice, deleteNotice, listNotices, updateNotice } from '../../../../lib/notices-server';
import { logActivity } from '../../../../lib/site-settings';

export const GET = adminRoute(async () => Response.json({ notices: await listNotices() }));

export const POST = adminRoute(async (request) => {
  const notice = await createNotice(await readJson(request));
  await logActivity('notice.create', `공지 등록: ${notice.title}`);
  return Response.json({ notice });
});

export const PATCH = adminRoute(async (request) => {
  const { id, ...changes } = await readJson(request);
  const notice = id && await updateNotice(id, changes);
  if (!notice) return Response.json({ error: '공지를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('notice.update', `공지 수정: ${notice.title}`);
  return Response.json({ notice });
});

export const DELETE = adminRoute(async (request) => {
  const id = new URL(request.url).searchParams.get('id');
  const removed = id && await deleteNotice(id);
  if (!removed) return Response.json({ error: '공지를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('notice.delete', `공지 삭제: ${removed.title}`);
  return Response.json({ ok: true });
});
