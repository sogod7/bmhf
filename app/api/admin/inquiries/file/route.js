import { adminRoute } from '../../../../../lib/admin-api';
import { getInquiry } from '../../../../../lib/inquiries';
import { privateDownloadUrl } from '../../../../../lib/uploads';

// Redirect to a short-lived signed URL for one attachment of one inquiry.
export const GET = adminRoute(async (request) => {
  const params = new URL(request.url).searchParams;
  const inquiry = await getInquiry(params.get('id') || '');
  const file = inquiry?.files?.find((item) => item.path === params.get('path'));
  if (!file) return Response.json({ error: '첨부파일을 찾을 수 없습니다.' }, { status: 404 });
  return Response.redirect(new URL(await privateDownloadUrl(file.path), request.url), 302);
});
