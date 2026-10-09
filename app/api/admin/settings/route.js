import { adminRoute, readJson } from '../../../../lib/admin-api';
import { getSettings, logActivity, updateSetting } from '../../../../lib/site-settings';

export const GET = adminRoute(async () => Response.json({ settings: await getSettings() }));

export const PATCH = adminRoute(async (request) => {
  const { key, value } = await readJson(request);
  const settings = await updateSetting(key, value);
  await logActivity('settings.update', key === 'language_visible' ? `다국어 전환 메뉴 ${value ? '노출' : '숨김'}` : `설정 변경: ${key}`);
  return Response.json({ settings });
});
