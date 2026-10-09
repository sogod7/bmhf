// Minimal server-only Supabase REST client (PostgREST + Storage) using the service role key.
// Never import this file from client components.

const SCHEMA = 'bmhf';

function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  return { url, key: process.env.SUPABASE_SERVICE_ROLE_KEY || '' };
}

export function isSupabaseConfigured() {
  const { url, key } = config();
  return Boolean(url && key);
}

function authHeaders(extra = {}) {
  const { key } = config();
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

async function parse(response, what) {
  const text = await response.text();
  const body = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!response.ok) {
    const message = typeof body === 'object' && body ? body.message || body.error || JSON.stringify(body) : body;
    throw new Error(`Supabase ${what} failed (${response.status}): ${message}`);
  }
  return body;
}

// PostgREST filters: { id: 'eq.123', status: 'in.(new,closed)' } plus order/limit/select.
export async function rest(method, table, { query = {}, body, prefer } = {}) {
  const { url } = config();
  const params = new URLSearchParams(query);
  const headers = authHeaders({ 'Accept-Profile': SCHEMA, 'Content-Profile': SCHEMA });
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  return parse(response, `${method} ${table}`);
}

export async function rpc(fn, args = {}) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: authHeaders({ 'Content-Profile': SCHEMA, 'Content-Type': 'application/json' }), body: JSON.stringify(args), cache: 'no-store' });
  return parse(response, `rpc ${fn}`);
}

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');

export async function storageSignedUpload(bucket, path) {
  const { url } = config();
  const response = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${encodePath(path)}`, { method: 'POST', headers: authHeaders(), cache: 'no-store' });
  const body = await parse(response, 'sign upload');
  return `${url}/storage/v1${body.url}`;
}

export async function storageSignedDownload(bucket, path, expiresIn = 300) {
  const { url } = config();
  const response = await fetch(`${url}/storage/v1/object/sign/${bucket}/${encodePath(path)}`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ expiresIn }), cache: 'no-store' });
  const body = await parse(response, 'sign download');
  return `${url}/storage/v1${body.signedURL}`;
}

export function storagePublicUrl(bucket, path) {
  return `${config().url}/storage/v1/object/public/${bucket}/${encodePath(path)}`;
}

export async function storageRemove(bucket, paths) {
  if (!paths.length) return;
  const { url } = config();
  const response = await fetch(`${url}/storage/v1/object/${bucket}`, { method: 'DELETE', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ prefixes: paths }), cache: 'no-store' });
  await parse(response, 'remove');
}
