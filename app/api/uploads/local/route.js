// Local-development stand-in for Supabase Storage signed URLs. Disabled once Supabase is configured.
import fs from 'node:fs';
import path from 'node:path';
import { isSupabaseConfigured } from '../../../../lib/supabase';
import { PUBLIC_BUCKET, localFilePath, verifyLocalSignature } from '../../../../lib/uploads';

const MAX_BYTES = 50 * 1024 * 1024;
const TYPES = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

function target(request) {
  const params = new URL(request.url).searchParams;
  const bucket = params.get('bucket') || ''; const filePath = params.get('path') || '';
  return { bucket, filePath, file: localFilePath(bucket, filePath), exp: params.get('exp'), sig: params.get('sig') };
}

export async function PUT(request) {
  if (isSupabaseConfigured()) return new Response('Not found', { status: 404 });
  const { bucket, filePath, file, exp, sig } = target(request);
  if (!file || !verifyLocalSignature('put', bucket, filePath, exp, sig)) return Response.json({ error: '업로드 권한이 없거나 만료되었습니다.' }, { status: 403 });
  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length > MAX_BYTES) return Response.json({ error: '파일이 너무 큽니다.' }, { status: 413 });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
  return Response.json({ ok: true });
}

export async function GET(request) {
  if (isSupabaseConfigured()) return new Response('Not found', { status: 404 });
  const { bucket, filePath, file, exp, sig } = target(request);
  if (!file || (bucket !== PUBLIC_BUCKET && !verifyLocalSignature('get', bucket, filePath, exp, sig))) return new Response('Forbidden', { status: 403 });
  if (!fs.existsSync(file)) return new Response('Not found', { status: 404 });
  const extension = filePath.split('.').pop().toLowerCase();
  return new Response(fs.readFileSync(file), { headers: { 'Content-Type': TYPES[extension] || 'application/octet-stream', 'Cache-Control': 'private, max-age=60' } });
}
