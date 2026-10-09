// Seed notices used before the database has its own rows (local development, first deploy).
export const initialNotices = [
  {
    title: 'BMHF 고주파 시스템 기술 상담 및 현장 지원 안내',
    notice_date: '2026-10-05',
    category: '공지',
    pinned: true,
    visible: true,
    body: '워크피스 재질, 형상, 목표 공정과 생산량을 알려주시면 담당 엔지니어가 직접 도면 검토 및 최적 고주파 시스템 구성을 제안해 드립니다.',
  },
  {
    title: '제품소개 라인업 및 고주파 가열 공정 영상자료 업데이트',
    notice_date: '2026-10-01',
    category: '소식',
    pinned: false,
    visible: true,
    body: '열처리, 브레이징, 가열기 29종 전 제품군과 실제 구동 공정 영상 자료실이 오픈되었습니다.',
  },
  {
    title: '고주파 맞춤 코일 설계 및 수리·개선 서비스 지원',
    notice_date: '2026-09-20',
    category: '기술',
    pinned: false,
    visible: true,
    body: '기존 사용 중이신 고주파 코일의 균일 가열 개선, 냉각 효율 증대, 수명 연장을 위한 형상 재설계 및 제작을 지원합니다.',
  },
];

export const displayDate = (value) => String(value || '').slice(0, 10).replaceAll('-', '.');

export function orderedNotices(items) {
  return [...items]
    .filter((item) => item.visible)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.notice_date).localeCompare(String(a.notice_date)));
}
