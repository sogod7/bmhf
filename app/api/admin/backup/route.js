import { adminRoute } from '../../../../lib/admin-api';
import { listInquiries } from '../../../../lib/inquiries';
import { listNotices } from '../../../../lib/notices-server';
import { listResources } from '../../../../lib/resources';
import { getSettings, listActivity, logActivity } from '../../../../lib/site-settings';
import { storageMode } from '../../../../lib/store';
import { listVideos } from '../../../../lib/videos-server';

// Full JSON export of admin-managed content (attachment files are referenced by path only).
export const GET = adminRoute(async () => {
  const [notices, videos, resources, inquiries, settings, activity] = await Promise.all([listNotices(), listVideos(), listResources(), listInquiries(), getSettings(), listActivity(1000)]);
  const data = { notices, videos, resources, inquiries, site_settings: settings, activity_log: activity };
  await logActivity('backup.export', '전체 데이터 백업 내려받기');
  const stamp = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const counts = { notices: notices.length, videos: videos.length, resources: resources.length, inquiries: inquiries.length, activity_log: activity.length };
  const body = JSON.stringify({ exported_at: new Date().toISOString(), storage: storageMode(), counts, data }, null, 2);
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="bmhf-backup-${stamp}.json"`, 'Cache-Control': 'no-store' } });
});
