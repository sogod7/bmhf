import { classify } from '../../../lib/analytics';
import { createInquiry } from '../../../lib/inquiries';
import { allowRequest, clientIp } from '../../../lib/rate-limit';
import { logActivity } from '../../../lib/site-settings';
import { isStorageWritable } from '../../../lib/store';
import { INQUIRY_FILE_LIMIT, isSafeStoragePath } from '../../../lib/uploads';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const text = (value, max) => String(value ?? '').trim().slice(0, max);

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === 'string'));
}

async function notify(inquiry, origin) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_NOTIFY_EMAIL) return;
  const rows = [['회사명', inquiry.company_name], ['담당자', inquiry.contact_name], ['연락처', inquiry.phone], ['이메일', inquiry.email || '-'], ['문의분야', inquiry.category], ['문의제품', inquiry.product_title || '-'], ['문의내용', inquiry.message || '-'], ['첨부파일', `${inquiry.files?.length || 0}개 (관리자 페이지에서 확인)`]];
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM_EMAIL || 'BMHF Website <onboarding@resend.dev>',
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `[BMHF 견적문의] ${inquiry.company_name} - ${inquiry.contact_name}님 (${inquiry.category})`.replace(/[\r\n]/g, ' '),
      html: `<h2>새로운 견적 문의가 접수되었습니다.</h2><table style="border-collapse:collapse;width:100%;max-width:600px">${rows.map(([label, value]) => `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:110px">${label}</td><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')}</table><p><a href="${origin}/admin/inquiries?id=${inquiry.id}">관리자 페이지에서 문의 확인하기</a></p>`,
    }),
  }).catch((error) => console.error('Inquiry notification failed:', error));
}

// Channel that brought the visitor (first visit and current session), classified like page views.
function attributionOf(input, request) {
  if (!input || typeof input !== 'object') return null;
  const siteHost = (request.headers.get('host') || '').toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '');
  const touch = (value) => {
    if (!value || typeof value !== 'object') return null;
    const { channel, source_name, search_term, utm_campaign } = classify({ url: String(value.u || '/').slice(0, 1000), referrer: String(value.r || '').slice(0, 1000), siteHost, ua: request.headers.get('user-agent') || '', internal: value.i === true });
    const at = Number(value.at);
    return { channel, source_name, search_term, utm_campaign, landing: String(value.u || '/').split('?')[0].slice(0, 300), at: Number.isFinite(at) && at > 0 ? new Date(at).toISOString() : null };
  };
  return { first: touch(input.first), session: touch(input.session) };
}

export async function POST(request) {
  if (!allowRequest(`inquiry:${clientIp(request)}`, 6)) return Response.json({ success: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });
  if (!isStorageWritable()) return Response.json({ success: false, error: '온라인 문의 접수 준비 중입니다. 전화(031-498-1292) 또는 이메일(master@bmhf.co.kr)로 문의해 주시기 바랍니다.' }, { status: 503 });
  try {
    const body = await readBody(request);
    if (body.hp_check) return Response.json({ success: true, message: '문의가 접수되었습니다.' });

    const company = text(body.company, 120); const name = text(body.name, 60); const phone = text(body.phone, 40); const email = text(body.email, 120);
    if (!company || !name || !phone) return Response.json({ success: false, error: '회사명, 담당자명, 연락처는 필수 입력 항목입니다.' }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ success: false, error: '이메일 형식을 확인해 주세요.' }, { status: 400 });
    if (!body.privacy) return Response.json({ success: false, error: '개인정보 수집 및 이용 동의가 필요합니다.' }, { status: 400 });

    const files = (Array.isArray(body.files) ? body.files : []).slice(0, INQUIRY_FILE_LIMIT.count)
      .filter((file) => isSafeStoragePath(file?.path, 'inquiries'))
      .map((file) => ({ path: file.path, name: text(file.name, 200), size: Number(file.size) || 0, type: text(file.type, 100) }));

    const inquiry = await createInquiry({
      company, name, phone, email, category: text(body.category, 60), message: text(body.message, 5000),
      productSlug: text(body.productSlug, 120), productTitle: text(body.productTitle, 200), locale: body.locale, files, ip: clientIp(request), attribution: attributionOf(body.attribution, request),
    });
    await logActivity('inquiry.create', `새 문의 접수: ${company}`);
    await notify(inquiry, new URL(request.url).origin);
    return Response.json({ success: true, message: '견적 및 기술상담 문의가 접수되었습니다. 담당 엔지니어가 신속히 연락드리겠습니다.', id: inquiry.id });
  } catch (error) {
    console.error('Error handling inquiry:', error);
    return Response.json({ success: false, error: '문의 접수 중 오류가 발생했습니다. 전화(031-498-1292)로 문의해 주시기 바랍니다.' }, { status: 500 });
  }
}
