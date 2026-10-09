import { adminRoute, readJson } from '../../../../lib/admin-api';
import { logActivity } from '../../../../lib/site-settings';
import { createVideo, deleteVideo, listVideos, reorderVideos, updateVideo } from '../../../../lib/videos-server';

export const GET = adminRoute(async () => Response.json({ videos: await listVideos() }));

export const POST = adminRoute(async (request) => {
  const video = await createVideo(await readJson(request));
  await logActivity('video.create', `영상 등록: ${video.title}`);
  return Response.json({ video });
});

export const PATCH = adminRoute(async (request) => {
  const { id, order, ...changes } = await readJson(request);
  if (Array.isArray(order)) {
    const videos = await reorderVideos(order.filter((item) => typeof item === 'string'));
    await logActivity('video.reorder', '영상 노출 순서 변경');
    return Response.json({ videos });
  }
  const video = id && await updateVideo(id, changes);
  if (!video) return Response.json({ error: '영상을 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('video.update', `영상 수정: ${video.title}`);
  return Response.json({ video });
});

export const DELETE = adminRoute(async (request) => {
  const id = new URL(request.url).searchParams.get('id');
  const removed = id && await deleteVideo(id);
  if (!removed) return Response.json({ error: '영상을 찾을 수 없습니다.' }, { status: 404 });
  await logActivity('video.delete', `영상 삭제: ${removed.title}`);
  return Response.json({ ok: true });
});
