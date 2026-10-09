import { createHash } from 'node:crypto';
import { INQUIRY_STATUSES } from './admin-constants';
import { get, insert, list, remove, update } from './store';
import { PRIVATE_BUCKET, removeFiles } from './uploads';

const TABLE = 'inquiries';
const STATUS_IDS = INQUIRY_STATUSES.map((status) => status.id);

export function hashIp(ip) { return createHash('sha256').update(`${process.env.ADMIN_SESSION_SECRET || 'bmhf'}:${ip}`).digest('hex').slice(0, 32); }

export async function listInquiries() {
  return list(TABLE, { order: [{ column: 'created_at', desc: true }] });
}

export async function getInquiry(id) { return get(TABLE, id); }

export async function createInquiry(input) {
  return insert(TABLE, {
    company_name: input.company, contact_name: input.name, phone: input.phone, email: input.email || null,
    category: input.category || '일반 문의', message: input.message || null, locale: input.locale === 'en' ? 'en' : 'ko',
    status: 'new', admin_memo: null, privacy_consent_at: new Date().toISOString(),
    product_slug: input.productSlug || null, product_title: input.productTitle || null, files: input.files || [], ip_hash: input.ip ? hashIp(input.ip) : null,
  });
}

export async function updateInquiry(id, { status, adminMemo }) {
  const patch = {};
  if (status !== undefined) { if (!STATUS_IDS.includes(status)) throw new Error('잘못된 상태 값입니다.'); patch.status = status; }
  if (adminMemo !== undefined) patch.admin_memo = String(adminMemo).slice(0, 5000);
  return update(TABLE, id, patch);
}

export async function deleteInquiry(id) {
  const removed = await remove(TABLE, id);
  if (removed?.files?.length) await removeFiles(PRIVATE_BUCKET, removed.files.map((file) => file.path)).catch(() => {});
  return removed;
}

export async function inquiryStats() {
  const rows = await list(TABLE, { order: [{ column: 'created_at', desc: true }] });
  const byStatus = Object.fromEntries(STATUS_IDS.map((id) => [id, 0]));
  for (const row of rows) byStatus[row.status] = (byStatus[row.status] || 0) + 1;
  const dayKey = (value) => new Date(new Date(value).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const today = Date.now();
  const days = Array.from({ length: 14 }, (_, index) => dayKey(today - (13 - index) * 86400 * 1000));
  const daily = Object.fromEntries(days.map((day) => [day, 0]));
  for (const row of rows) { const key = dayKey(row.created_at); if (key in daily) daily[key] += 1; }
  const since = (ms) => rows.filter((row) => today - new Date(row.created_at).getTime() < ms).length;
  return { total: rows.length, byStatus, last7: since(7 * 86400 * 1000), last30: since(30 * 86400 * 1000), daily: days.map((day) => ({ day, count: daily[day] })), recent: rows.slice(0, 5) };
}
