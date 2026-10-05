export const noticeStorageKey = 'bmhf-notice-draft';

export const initialNotices = [
  { id: 'notice-1', title: 'BMHF 고주파 시스템 기술 상담 안내', date: '2026.10.05', category: '공지', pinned: true, visible: true, body: '워크피스 재질, 형상, 목표 공정과 생산량을 알려주시면 담당 엔지니어가 검토합니다.' },
  { id: 'notice-2', title: '제품소개 및 영상자료 업데이트', date: '2026.10.01', category: '소식', pinned: false, visible: true, body: '열처리, 브레이징, 가열기 제품군의 소개 자료를 확인하실 수 있습니다.' },
];

export function orderedNotices(items) { return [...items].filter((item) => item.visible).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)); }
