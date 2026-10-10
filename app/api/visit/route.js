import { BOT_PATTERN, classify, parseUserAgent, recordView } from '../../../lib/analytics';
import { allowRequest, clientIp } from '../../../lib/rate-limit';
import { isStorageWritable } from '../../../lib/store';

// Page-view beacon sent by /bmhf-v.js from every public page.
const ID = /^[A-Za-z0-9-]{8,64}$/;
const done = () => new Response(null, { status: 204 });
const text = (value, max) => { const result = String(value ?? '').trim().slice(0, max); return result || null; };

export async function POST(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT_PATTERN.test(ua) || !isStorageWritable()) return done();
  if (!allowRequest(`visit:${clientIp(request)}`, 90)) return done();
  let body;
  try { body = JSON.parse(await request.text()); } catch { return done(); }
  if (!ID.test(body?.v || '') || !ID.test(body?.s || '')) return done();

  let path;
  try { path = new URL(String(body.p || '/'), 'https://bmhf.local').pathname.slice(0, 300); } catch { return done(); }
  if (path.startsWith('/admin') || path.startsWith('/api/')) return done();

  const siteHost = (request.headers.get('host') || '').toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '');
  const source = classify({ url: String(body.u || '/').slice(0, 1000), referrer: String(body.r || '').slice(0, 1000), siteHost });
  const city = request.headers.get('x-vercel-ip-city');
  try {
    await recordView({
      visitor_id: body.v, session_id: body.s, is_landing: body.l === true, path, title: text(body.t, 160),
      ...source, ...parseUserAgent(ua),
      country: text(request.headers.get('x-vercel-ip-country'), 2),
      city: city ? text(decodeURIComponent(city), 80) : null,
      lang: text(body.lang, 20),
    });
  } catch (error) {
    console.error('[visit] record failed:', error.message);
  }
  return done();
}
