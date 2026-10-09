import { youtubeId, youtubeThumbnail } from './admin-constants';
import { insert, list, registerSeed, remove, update } from './store';
import { videoLibrary } from './video-library';

const TABLE = 'videos';
registerSeed(TABLE, videoLibrary.map((video, index) => ({ title: video.title, video_url: video.videoUrl, thumbnail: video.thumbnail, visible: video.visible, sort_order: index + 1 })));

function clean(input) {
  const values = {};
  if (input.title !== undefined) { values.title = String(input.title).trim().slice(0, 200); if (!values.title) throw new Error('제목을 입력하세요.'); }
  if (input.video_url !== undefined) { values.video_url = String(input.video_url).trim(); if (!youtubeId(values.video_url)) throw new Error('유튜브 영상 주소를 입력하세요. (youtube.com/watch?v=… 또는 youtu.be/…)'); }
  if (input.thumbnail !== undefined) values.thumbnail = String(input.thumbnail).trim().slice(0, 500);
  if (input.visible !== undefined) values.visible = Boolean(input.visible);
  if (input.sort_order !== undefined) values.sort_order = Number(input.sort_order) || 0;
  return values;
}

export const videoThumbnail = (video) => video.thumbnail || youtubeThumbnail(video.video_url);

export async function listVideos() { return list(TABLE, { order: [{ column: 'sort_order' }, { column: 'created_at' }] }); }
export async function listPublicVideos() { return (await listVideos()).filter((video) => video.visible); }

export async function createVideo(input) {
  const rows = await listVideos();
  const values = clean({ visible: true, ...input });
  if (!values.title || !values.video_url) throw new Error('제목과 영상 주소를 입력하세요.');
  return insert(TABLE, { thumbnail: '', ...values, sort_order: rows.reduce((max, row) => Math.max(max, row.sort_order || 0), 0) + 1 });
}
export async function updateVideo(id, input) { return update(TABLE, id, clean(input)); }
export async function deleteVideo(id) { return remove(TABLE, id); }
export async function reorderVideos(ids) {
  await Promise.all(ids.map((id, index) => update(TABLE, id, { sort_order: index + 1 })));
  return listVideos();
}
