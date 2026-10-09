// Shared by server modules and client admin components (no Node APIs here).
export const INQUIRY_STATUSES = [
  { id: 'new', label: '신규', tone: 'amber' },
  { id: 'in_progress', label: '진행 중', tone: 'blue' },
  { id: 'answered', label: '답변 완료', tone: 'green' },
  { id: 'closed', label: '종결', tone: 'gray' },
];
export const inquiryStatusLabel = (id) => INQUIRY_STATUSES.find((status) => status.id === id)?.label || id;

export const NOTICE_CATEGORIES = ['공지', '소식', '기술', '전시회', '채용'];

export const RESOURCE_TYPES = [
  { id: 'catalog', label: '카탈로그', en: 'Catalogue' },
  { id: 'technical_data', label: '기술 사양서', en: 'Specification Sheet' },
  { id: 'manual', label: '가이드·매뉴얼', en: 'Application Guide' },
  { id: 'certificate', label: '인증서', en: 'Certificate' },
  { id: 'profile', label: '회사 소개서', en: 'Company Profile' },
];
export const resourceTypeLabel = (id, locale = 'ko') => { const type = RESOURCE_TYPES.find((item) => item.id === id); return type ? (locale === 'en' ? type.en : type.label) : id; };

export function formatBytes(bytes) {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB']; let value = Number(bytes); let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}

export function youtubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0] || null;
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(parsed.hostname)) return null;
    if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
    const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/);
    return match ? match[1] : null;
  } catch { return null; }
}
export const youtubeThumbnail = (url) => { const id = youtubeId(url); return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''; };
