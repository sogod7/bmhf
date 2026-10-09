import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken, isAdminAuthConfigured } from '../../../../lib/admin-auth';
import { hashIp } from '../../../../lib/inquiries';
import { logActivity } from '../../../../lib/site-settings';
import { insert, list } from '../../../../lib/store';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

function same(left, right) {
  const a = Buffer.from(left || ''); const b = Buffer.from(right || '');
  return a.length === b.length && timingSafeEqual(a, b);
}

async function recentFailures(ipHash) {
  try {
    const rows = await list('login_attempts', { eq: { ip_hash: ipHash }, gte: { created_at: new Date(Date.now() - WINDOW_MS).toISOString() }, order: [{ column: 'created_at', desc: true }], limit: 20 });
    const failures = [];
    for (const row of rows) { if (row.success) break; failures.push(row); }
    return failures.length;
  } catch { return 0; }
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await request.json().catch(() => ({})) : Object.fromEntries(await request.formData().catch(() => new FormData()));
  if (body.action === 'logout') {
    const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
    response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(), maxAge: 0 });
    return response;
  }
  if (!isAdminAuthConfigured()) return NextResponse.json({ error: '관리자 로그인 환경변수가 설정되지 않았습니다.' }, { status: 503 });

  const ipHash = hashIp(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown');
  if (await recentFailures(ipHash) >= MAX_FAILURES) return NextResponse.json({ error: '로그인 실패가 반복되어 15분간 잠겼습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });

  const ok = same(body.email, process.env.ADMIN_EMAIL) && same(body.password, process.env.ADMIN_PASSWORD);
  await insert('login_attempts', { ip_hash: ipHash, success: ok }).catch(() => {});
  if (!ok) return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

  await logActivity('login', '관리자 로그인');
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions());
  return response;
}
