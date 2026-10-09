import { activeBanner, getSettings } from '../../../lib/site-settings';

// Public site switches read by the header scripts.
export async function GET() {
  const settings = await getSettings();
  return Response.json({ languageVisible: settings.language_visible !== false, banner: activeBanner(settings) }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } });
}
