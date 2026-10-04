import { NextResponse } from 'next/server';
import { hasAdminSession } from '../../../../lib/admin-auth';

export async function POST(request) {
  if (!await hasAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { visible } = await request.json();
  const response = NextResponse.json({ visible: Boolean(visible) });
  response.cookies.set('bmhf_language_visible', visible ? 'on' : 'off', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return response;
}
