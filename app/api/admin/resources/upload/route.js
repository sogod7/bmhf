import { adminRoute, readJson } from '../../../../../lib/admin-api';
import { PUBLIC_BUCKET, RESOURCE_FILE_LIMIT, extensionOf, signedUploadUrl, storagePath } from '../../../../../lib/uploads';

// Issue a signed upload URL for one technical document; the browser PUTs the file directly.
export const POST = adminRoute(async (request) => {
  const { name, size } = await readJson(request);
  if (!name || !RESOURCE_FILE_LIMIT.extensions.includes(extensionOf(name))) throw new Error(`허용되지 않는 파일 형식입니다. (${RESOURCE_FILE_LIMIT.extensions.join(', ')})`);
  if (!(Number(size) > 0) || Number(size) > RESOURCE_FILE_LIMIT.bytes) throw new Error('파일은 50MB 이하여야 합니다.');
  const path = storagePath('resources', name);
  return Response.json({ path, uploadUrl: await signedUploadUrl(PUBLIC_BUCKET, path) });
});
