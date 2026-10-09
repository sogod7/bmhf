import { hasAdminSession } from './admin-auth';
import { StorageUnavailableError } from './store';

// Wrap an admin route handler: requires a session and maps thrown errors to JSON responses.
export function adminRoute(handler) {
  return async (request, context) => {
    if (!await hasAdminSession()) return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof StorageUnavailableError) return Response.json({ error: error.message }, { status: 503 });
      if (String(error.message).startsWith('Supabase')) { console.error(error); return Response.json({ error: '저장소 처리 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.' }, { status: 502 }); }
      return Response.json({ error: error.message || '요청을 처리하지 못했습니다.' }, { status: 400 });
    }
  };
}

export async function readJson(request) {
  try { return await request.json(); } catch { throw new Error('요청 형식이 올바르지 않습니다.'); }
}
