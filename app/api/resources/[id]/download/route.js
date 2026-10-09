import { getResource, recordDownload } from '../../../../../lib/resources';

export async function GET(request, { params }) {
  const { id } = await params;
  const resource = await getResource(id).catch(() => null);
  if (!resource || resource.status !== 'published') return new Response('Not found', { status: 404 });
  await recordDownload(resource).catch(() => {});
  return Response.redirect(new URL(resource.file_url, request.url), 302);
}
