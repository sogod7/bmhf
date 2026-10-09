import { displayDate } from '../../../lib/notices';
import { listPublicNotices } from '../../../lib/notices-server';

// Public notice feed for the static homepage.
export async function GET(request) {
  const limit = Number(new URL(request.url).searchParams.get('limit')) || undefined;
  const notices = (await listPublicNotices(limit).catch(() => [])).map((notice) => ({ id: notice.id, title: notice.title, category: notice.category, date: displayDate(notice.notice_date), pinned: notice.pinned }));
  return Response.json({ notices }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } });
}
