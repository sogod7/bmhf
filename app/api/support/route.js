const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const limit = new Map();

function fallback() {
  return '고주파 열처리·브레이징·유도가열기·맞춤 코일 상담을 도와드릴 수 있습니다. 워크피스 재질, 형상, 목표 공정, 생산량을 알려주시면 담당 엔지니어 연결을 안내하겠습니다.';
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (limit.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 12) return Response.json({ error: '잠시 후 다시 시도해 주세요.' }, { status: 429 });
  recent.push(now); limit.set(ip, recent);
  const { message, locale = 'ko' } = await request.json().catch(() => ({}));
  if (typeof message !== 'string' || !message.trim() || message.length > 1200) return Response.json({ error: '문의 내용을 1~1200자로 입력해 주세요.' }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return Response.json({ answer: fallback(), model: 'fallback' });
  const language = locale === 'en' ? 'English' : 'Korean';
  const prompt = `You are BMHF's industrial induction-heating customer assistant. Reply in ${language}. Keep every sentence short. Never invent specifications, prices, lead times, certifications, or customer references. Explain only general capabilities: induction heat treatment and tempering, brazing, induction heating, custom coils, fixtures, cooling and automation. If a request needs engineering verification, say that an engineer will review it and ask for material, workpiece geometry, target process, quantity, and installation constraints. User question: ${message.trim()}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 500 } }) });
    if (!response.ok) throw new Error('Gemini request failed');
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    return Response.json({ answer: answer || fallback(), model: MODEL });
  } catch { return Response.json({ answer: fallback(), model: 'fallback' }); }
}
