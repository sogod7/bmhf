import { allowRequest, clientIp } from '../../../../lib/rate-limit';
import { isStorageWritable } from '../../../../lib/store';
import { INQUIRY_FILE_LIMIT, PRIVATE_BUCKET, extensionOf, signedUploadUrl, storagePath } from '../../../../lib/uploads';

// Step 1 of the public quote form: issue private signed upload URLs for attachments.
export async function POST(request) {
  if (!allowRequest(`upload:${clientIp(request)}`, 10)) return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });
  if (!isStorageWritable()) return Response.json({ error: '온라인 문의 접수 준비 중입니다. 전화(031-498-1292) 또는 이메일(master@bmhf.co.kr)로 문의해 주시기 바랍니다.' }, { status: 503 });
  const { files } = await request.json().catch(() => ({}));
  if (!Array.isArray(files) || !files.length) return Response.json({ error: '첨부할 파일 정보가 없습니다.' }, { status: 400 });
  if (files.length > INQUIRY_FILE_LIMIT.count) return Response.json({ error: `첨부파일은 최대 ${INQUIRY_FILE_LIMIT.count}개까지 가능합니다.` }, { status: 400 });
  for (const file of files) {
    if (!INQUIRY_FILE_LIMIT.extensions.includes(extensionOf(file?.name))) return Response.json({ error: `허용되지 않는 파일 형식입니다: ${file?.name}` }, { status: 400 });
    if (!(Number(file.size) > 0) || Number(file.size) > INQUIRY_FILE_LIMIT.bytes) return Response.json({ error: `파일 크기는 20MB 이하여야 합니다: ${file.name}` }, { status: 400 });
  }
  try {
    const uploads = await Promise.all(files.map(async (file) => { const path = storagePath('inquiries', file.name); return { name: String(file.name).slice(0, 200), size: Number(file.size), type: String(file.type || '').slice(0, 100), path, uploadUrl: await signedUploadUrl(PRIVATE_BUCKET, path) }; }));
    return Response.json({ uploads });
  } catch (error) {
    console.error('Inquiry upload signing failed:', error);
    return Response.json({ error: '파일 업로드를 준비하지 못했습니다. 파일 없이 접수하거나 전화로 문의해 주세요.' }, { status: 502 });
  }
}
