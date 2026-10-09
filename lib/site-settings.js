import { insert, list, registerSeed, upsert } from './store';

const DEFAULTS = { language_visible: true };
registerSeed('site_settings', Object.entries(DEFAULTS).map(([key, value]) => ({ key, value })));

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
  if (typeof value !== typeof DEFAULTS[key]) throw new Error('설정 값 형식이 올바르지 않습니다.');
  await upsert('site_settings', { key, value }, 'key');
  return getSettings();
}

export async function logActivity(action, detail = '') {
  try { await insert('activity_log', { action, detail: String(detail).slice(0, 500) }); } catch {}
}

export async function listActivity(limit = 12) {
  try { return await list('activity_log', { order: [{ column: 'created_at', desc: true }], limit }); } catch { return []; }
}
