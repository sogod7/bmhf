import { activeBanner, getSettings } from '../../../lib/site-settings';
import { displayDate } from '../../../lib/notices';
import { listPublicNotices } from '../../../lib/notices-server';

// Notices the admin marked as homepage popups; hidden or deleted notices drop out.
async function popupNotices(ids) {
  if (!ids?.length) return [];
  const notices = await listPublicNotices().catch(() => []);
  return ids.map((id) => notices.find((notice) => notice.id === id)).filter(Boolean)
    .map((notice) => ({ id: notice.id, title: notice.title, category: notice.category, date: displayDate(notice.notice_date), body: notice.body || '' }));
}

// Public site switches read by the header scripts.
export async function GET() {
  const settings = await getSettings();
  return Response.json({ languageVisible: settings.language_visible !== false, languageMobileVisible: settings.language_mobile_visible !== false, banner: activeBanner(settings), popups: await popupNotices(settings.popup_notices) }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } });
}
