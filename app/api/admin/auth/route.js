import { timingSafeEqual } from 'node:crypto';
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken, isAdminAuthConfigured } from '../../../../lib/admin-auth';

function same(left, right) {
  const a = Buffer.from(left || ''); const b = Buffer.from(right || '');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await request.json().catch(() => ({})) : Object.fromEntries(await request.formData().catch(() => new FormData()));
  if (body.action === 'logout') { const response = Response.redirect(new URL('/admin/login', request.url), 303); response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(), maxAge: 0 }); return response; }
  if (!isAdminAuthConfigured()) return Response.json({ error: '관리자 로그인 환경변수가 설정되지 않았습니다.' }, { status: 503 });
  if (!same(body.email, process.env.ADMIN_EMAIL) || !same(body.password, process.env.ADMIN_PASSWORD)) return Response.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  const response = Response.json({ ok: true }); response.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions()); return response;
}
