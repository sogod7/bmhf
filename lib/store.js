// Table storage used by the admin console and public pages.
// Production uses Supabase (bmhf schema). Without Supabase credentials it falls back to
// JSON files in ./data so local development works; that fallback is not durable on Vercel.
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { isSupabaseConfigured, rest } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const TIMESTAMPED = new Set(['inquiries', 'notices', 'videos', 'resources', 'site_settings']);
const seeds = new Map();

export function registerSeed(table, rows) { seeds.set(table, rows); }
export function storageMode() { return isSupabaseConfigured() ? 'supabase' : 'local'; }
// Returns null when the Supabase tables can be read, otherwise the error message (shown to admins).
export async function storageProblem() {
  if (!isSupabaseConfigured()) return null;
  try { await rest('GET', 'notices', { query: { select: 'id', limit: '1' } }); return null; } catch (error) { return error.message; }
}
// Local JSON files only persist outside Vercel (development); on Vercel writes need Supabase.
export function isStorageWritable() { return isSupabaseConfigured() || !process.env.VERCEL; }
export class StorageUnavailableError extends Error {}

function seedId(table, index) { const hex = createHash('sha256').update(`${table}:${index}`).digest('hex'); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`; }
function localFile(table) { return path.join(DATA_DIR, `${table}.json`); }
function localRead(table) {
  try { return JSON.parse(fs.readFileSync(localFile(table), 'utf8')); } catch {}
  return seedRows(table);
}
// Built-in default rows, also served to public pages when the database cannot be read.
// Stable ids so links to seed rows keep working across requests before anything is saved.
// Catch handler for public reads: log why the database failed, then serve the seed rows.
export const seedFallback = (table) => (error) => { console.error(`[store] ${table} read failed, serving seed rows: ${error.message}`); return seedRows(table); };
export function seedRows(table) {
  const now = new Date().toISOString();
  return (seeds.get(table) || []).map((row, index) => ({ id: seedId(table, index), created_at: now, ...(TIMESTAMPED.has(table) ? { updated_at: now } : {}), ...row }));
}
function localWrite(table, rows) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(localFile(table), JSON.stringify(rows, null, 2), 'utf8');
  } catch (error) {
    throw new StorageUnavailableError(`저장소가 연결되지 않아 저장할 수 없습니다. Supabase 환경변수를 설정하세요. (${error.code || error.message})`);
  }
}

function matches(row, { eq = {}, gte = {}, lt = {} }) {
  return Object.entries(eq).every(([key, value]) => row[key] === value) && Object.entries(gte).every(([key, value]) => String(row[key] ?? '') >= String(value)) && Object.entries(lt).every(([key, value]) => String(row[key] ?? '') < String(value));
}
function sorter(order) {
  return (a, b) => {
    for (const { column, desc } of order) {
      const left = a[column] ?? ''; const right = b[column] ?? '';
      if (left < right) return desc ? 1 : -1;
      if (left > right) return desc ? -1 : 1;
    }
    return 0;
  };
}
function restQuery({ eq = {}, gte = {}, lt = {}, order = [], limit, offset, idColumn, id } = {}) {
  const query = {};
  for (const [key, value] of Object.entries(eq)) query[key] = `eq.${value}`;
  for (const [key, value] of Object.entries(gte)) query[key] = `gte.${value}`;
  for (const [key, value] of Object.entries(lt)) query[key] = `lt.${value}`;
  if (idColumn) query[idColumn] = `eq.${id}`;
  if (order.length) query.order = order.map(({ column, desc }) => `${column}.${desc ? 'desc' : 'asc'}`).join(',');
  if (limit) query.limit = String(limit);
  if (offset) query.offset = String(offset);
  return query;
}

// options: { eq: {col: value}, gte: {col: value}, lt: {col: value}, order: [{column, desc}], limit, offset, select: 'col,col' }
export async function list(table, options = {}) {
  if (isSupabaseConfigured()) return rest('GET', table, { query: { select: options.select || '*', ...restQuery(options) } });
  let rows = localRead(table).filter((row) => matches(row, options));
  if (options.order?.length) rows = rows.sort(sorter(options.order));
  const start = options.offset || 0;
  return options.limit ? rows.slice(start, start + options.limit) : rows.slice(start);
}

export async function get(table, id, idColumn = 'id') {
  if (isSupabaseConfigured()) return (await rest('GET', table, { query: { select: '*', ...restQuery({ idColumn, id }) } }))[0] || null;
  return localRead(table).find((row) => row[idColumn] === id) || null;
}

export async function insert(table, row) {
  if (isSupabaseConfigured()) return (await rest('POST', table, { body: row, prefer: 'return=representation' }))[0];
  const now = new Date().toISOString();
  const record = { id: randomUUID(), created_at: now, ...(TIMESTAMPED.has(table) ? { updated_at: now } : {}), ...row };
  const rows = localRead(table); rows.unshift(record); localWrite(table, rows);
  return record;
}

export async function update(table, id, patch, idColumn = 'id') {
  const values = TIMESTAMPED.has(table) ? { ...patch, updated_at: new Date().toISOString() } : patch;
  if (isSupabaseConfigured()) return (await rest('PATCH', table, { query: restQuery({ idColumn, id }), body: values, prefer: 'return=representation' }))[0] || null;
  const rows = localRead(table); const index = rows.findIndex((row) => row[idColumn] === id);
  if (index === -1) return null;
  rows[index] = { ...rows[index], ...values }; localWrite(table, rows);
  return rows[index];
}

export async function upsert(table, row, idColumn = 'id') {
  const values = TIMESTAMPED.has(table) ? { ...row, updated_at: new Date().toISOString() } : row;
  if (isSupabaseConfigured()) return (await rest('POST', table, { query: { on_conflict: idColumn }, body: values, prefer: 'resolution=merge-duplicates,return=representation' }))[0];
  const rows = localRead(table); const index = rows.findIndex((item) => item[idColumn] === row[idColumn]);
  if (index === -1) rows.unshift({ created_at: new Date().toISOString(), ...values }); else rows[index] = { ...rows[index], ...values };
  localWrite(table, rows);
  return rows[index === -1 ? 0 : index];
}

export async function remove(table, id, idColumn = 'id') {
  if (isSupabaseConfigured()) return (await rest('DELETE', table, { query: restQuery({ idColumn, id }), prefer: 'return=representation' }))[0] || null;
  const rows = localRead(table); const index = rows.findIndex((row) => row[idColumn] === id);
  if (index === -1) return null;
  const [removed] = rows.splice(index, 1); localWrite(table, rows);
  return removed;
}
