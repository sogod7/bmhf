import { NOTICE_CATEGORIES } from './admin-constants';
import { initialNotices, orderedNotices } from './notices';
import { insert, list, registerSeed, remove, seedRows, update } from './store';

const TABLE = 'notices';
registerSeed(TABLE, initialNotices);

function clean(input) {
  const values = {};
  if (input.title !== undefined) { values.title = String(input.title).trim().slice(0, 200); if (!values.title) throw new Error('제목을 입력하세요.'); }
  if (input.category !== undefined) values.category = NOTICE_CATEGORIES.includes(input.category) ? input.category : String(input.category).trim().slice(0, 30) || '공지';
  if (input.body !== undefined) values.body = String(input.body).slice(0, 20000);
  if (input.notice_date !== undefined) { if (!/^\d{4}-\d{2}-\d{2}$/.test(input.notice_date)) throw new Error('등록일 형식이 올바르지 않습니다.'); values.notice_date = input.notice_date; }
  if (input.pinned !== undefined) values.pinned = Boolean(input.pinned);
  if (input.visible !== undefined) values.visible = Boolean(input.visible);
  return values;
}

export async function listNotices() {
  return list(TABLE, { order: [{ column: 'pinned', desc: true }, { column: 'notice_date', desc: true }, { column: 'created_at', desc: true }] });
}
export async function listPublicNotices(limit) {
  const rows = orderedNotices(await listNotices().catch(() => seedRows(TABLE)));
  return limit ? rows.slice(0, limit) : rows;
}
export async function createNotice(input) {
  return insert(TABLE, { category: '공지', body: '', notice_date: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10), pinned: false, visible: true, ...clean(input) });
}
export async function updateNotice(id, input) { return update(TABLE, id, clean(input)); }
export async function deleteNotice(id) { return remove(TABLE, id); }
