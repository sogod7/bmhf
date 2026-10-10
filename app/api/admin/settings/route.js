import { adminRoute, readJson } from '../../../../lib/admin-api';
import { getSettings, logActivity, updateSetting } from '../../../../lib/site-settings';

export const GET = adminRoute(async () => Response.json({ settings: await getSettings() }));

const describe = (key, value) => {
  if (key === 'language_visible') return `PC 다국어 전환 버튼 ${value ? '노출' : '숨김'}`;
  if (key === 'language_mobile_visible') return `모바일 메뉴 다국어 버튼 ${value ? '노출' : '숨김'}`;
  if (key === 'popup_notices') return `공지 팝업 ${value?.length ? `${value.length}건 게시` : '내림'}`;
  if (key === 'site_banner') return value?.enabled ? `상단 안내 배너 게시: ${String(value.text || '').slice(0, 40)}` : '상단 안내 배너 내림';
  return `설정 변경: ${key}`;
};

export const PATCH = adminRoute(async (request) => {
  const { key, value } = await readJson(request);
  const settings = await updateSetting(key, value);
  await logActivity('settings.update', describe(key, settings[key]));
  return Response.json({ settings });
});
