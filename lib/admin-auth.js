import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'bmhf_admin_session';
const maxAge = 60 * 60 * 12;

function secret() { return process.env.ADMIN_SESSION_SECRET || ''; }
function sign(value) { return createHmac('sha256', secret()).update(value).digest('base64url'); }

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && secret().length >= 32);
}

export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + maxAge * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || !isAdminAuthConfigured()) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); return value.role === 'admin' && value.exp > Date.now(); } catch { return false; }
}

export async function hasAdminSession() {
  return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge };
}
