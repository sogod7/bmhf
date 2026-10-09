import { adminRoute, readJson } from '../../../../lib/admin-api';
import { createResource, deleteResource, listResources, updateResource } from '../../../../lib/resources';
import { logActivity } from '../../../../lib/site-settings';

export const GET = adminRoute(async () => Response.json({ resources: await listResources() }));

export const POST = adminRoute(async (request) => {
  const resource = await createResource(await readJson(request));
  await logActivity('resource.create', `기술자료 등록: ${resource.title_ko}`);
  return Response.json({ resource });
});

export const PATCH = adminRoute(async (request) => {
  const { id, ...changes } = await readJson(request);
  const resource = id && await updateResource(id, changes);
  if (!resource) return Response.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('resource.update', `기술자료 수정: ${resource.title_ko}`);
  return Response.json({ resource });
});

export const DELETE = adminRoute(async (request) => {
  const id = new URL(request.url).searchParams.get('id');
  const removed = id && await deleteResource(id);
  if (!removed) return Response.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('resource.delete', `기술자료 삭제: ${removed.title_ko}`);
  return Response.json({ ok: true });
});
