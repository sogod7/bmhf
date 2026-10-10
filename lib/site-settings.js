import { insert, list, registerSeed, upsert } from './store';

const DEFAULTS = {
  language_visible: true,
  // Separate switch for the 한국어/English buttons inside the mobile hamburger menu.
  language_mobile_visible: true,
  // Announcement strip shown above the header on every public page.
  site_banner: { enabled: false, text: '', link: '', until: '' },
  // Notice ids shown as a popup on the homepage (in this order).
  popup_notices: [],
};
registerSeed('site_settings', Object.entries(DEFAULTS).map(([key, value]) => ({ key, value })));

const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

function sanitize(key, value) {
  if (key === 'popup_notices') {
    if (!Array.isArray(value)) throw new Error('설정 값 형식이 올바르지 않습니다.');
    return [...new Set(value.map(String).filter((id) => /^[0-9a-f-]{36}$/i.test(id)))].slice(0, 5);
  }
  if (key !== 'site_banner') return value;
  const text = String(value?.text || '').trim().slice(0, 200);
  const link = String(value?.link || '').trim().slice(0, 300);
  const until = String(value?.until || '').trim();
  if (link && !/^(https?:\/\/|\/)/.test(link)) throw new Error('링크는 / 또는 https:// 로 시작해야 합니다.');
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) throw new Error('종료일 형식이 올바르지 않습니다.');
  if (value?.enabled && !text) throw new Error('배너 문구를 입력하세요.');
  return { enabled: Boolean(value?.enabled), text, link, until };
}

export async function getSettings() {
  try {
    const rows = await list('site_settings');
    return { ...DEFAULTS, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function updateSetting(key, value) {
  if (!(key in DEFAULTS)) throw new Error('알 수 없는 설정입니다.');
  if (typeof value !== typeof DEFAULTS[key] || value === null) throw new Error('설정 값 형식이 올바르지 않습니다.');
  await upsert('site_settings', { key, value: sanitize(key, value) }, 'key');
  return getSettings();
}

// The banner visitors should see right now, or null.
export function activeBanner(settings) {
  const banner = settings.site_banner;
  if (!banner?.enabled || !banner.text || (banner.until && kstToday() > banner.until)) return null;
  let hash = 0;
  for (const char of `${banner.text}|${banner.link}|${banner.until}`) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return { id: (hash >>> 0).toString(36), text: banner.text, link: banner.link };
}

export async function logActivity(action, detail = '') {
  try { await insert('activity_log', { action, detail: String(detail).slice(0, 500) }); } catch {}
}

export async function listActivity(limit = 12) {
  try { return await list('activity_log', { order: [{ column: 'created_at', desc: true }], limit }); } catch { return []; }
}
