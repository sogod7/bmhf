// File storage: Supabase Storage in production, ./data/uploads locally.
// Browsers upload straight to a signed URL so large files bypass the serverless body limit.
import fs from 'node:fs';
import path from 'node:path';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { isSupabaseConfigured, storagePublicUrl, storageRemove, storageSignedDownload, storageSignedUpload } from './supabase';

export const PUBLIC_BUCKET = 'bmhf-public-assets';
export const PRIVATE_BUCKET = 'bmhf-private-inquiries';
const LOCAL_ROOT = path.join(process.cwd(), 'data', 'uploads');

export const INQUIRY_FILE_LIMIT = { count: 5, bytes: 20 * 1024 * 1024, extensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'dwg', 'dxf', 'step', 'stp', 'igs', 'iges', 'zip', 'xlsx', 'xls', 'docx', 'doc', 'hwp', 'pptx'] };
export const RESOURCE_FILE_LIMIT = { bytes: 50 * 1024 * 1024, extensions: ['pdf', 'zip', 'docx', 'xlsx', 'pptx', 'hwp', 'jpg', 'png'] };

export function extensionOf(name) { return (String(name).split('.').pop() || '').toLowerCase(); }

export function storagePath(prefix, originalName) {
  const extension = extensionOf(originalName).replace(/[^a-z0-9]/g, '').slice(0, 8);
  const month = new Date().toISOString().slice(0, 7).replace('-', '');
  return `${prefix}/${month}/${randomUUID()}${extension ? `.${extension}` : ''}`;
}

export function isSafeStoragePath(value, prefix) {
  return typeof value === 'string' && value.startsWith(`${prefix}/`) && /^[a-z0-9/_.-]+$/i.test(value) && !value.includes('..');
}

function localSecret() { return process.env.ADMIN_SESSION_SECRET || 'bmhf-local-development-only'; }
function localSignature(action, bucket, filePath, expires) { return createHmac('sha256', localSecret()).update(`${action}:${bucket}:${filePath}:${expires}`).digest('base64url'); }
function localUrl(action, bucket, filePath, ttlSeconds) {
  const expires = Date.now() + ttlSeconds * 1000;
  const params = new URLSearchParams({ bucket, path: filePath, exp: String(expires), sig: localSignature(action, bucket, filePath, expires) });
  return `/api/uploads/local?${params}`;
}
export function verifyLocalSignature(action, bucket, filePath, expires, signature) {
  if (!signature || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(localSignature(action, bucket, filePath, expires)); const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function localFilePath(bucket, filePath) {
  if (![PUBLIC_BUCKET, PRIVATE_BUCKET].includes(bucket) || !/^[a-z0-9/_.-]+$/i.test(filePath) || filePath.includes('..')) return null;
  return path.join(LOCAL_ROOT, bucket, filePath);
}

export async function signedUploadUrl(bucket, filePath) {
  if (isSupabaseConfigured()) return storageSignedUpload(bucket, filePath);
  return localUrl('put', bucket, filePath, 600);
}

export function publicFileUrl(filePath) {
  if (isSupabaseConfigured()) return storagePublicUrl(PUBLIC_BUCKET, filePath);
  return `/api/uploads/local?${new URLSearchParams({ bucket: PUBLIC_BUCKET, path: filePath })}`;
}

export async function privateDownloadUrl(filePath) {
  if (isSupabaseConfigured()) return storageSignedDownload(PRIVATE_BUCKET, filePath, 300);
  return localUrl('get', PRIVATE_BUCKET, filePath, 300);
}

export async function removeFiles(bucket, paths) {
  const valid = paths.filter(Boolean);
  if (!valid.length) return;
  if (isSupabaseConfigured()) return storageRemove(bucket, valid);
  for (const filePath of valid) { const target = localFilePath(bucket, filePath); if (target) fs.rmSync(target, { force: true }); }
}
