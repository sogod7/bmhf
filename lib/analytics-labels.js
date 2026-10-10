// Traffic channels (접속 경로) and source display names for the analytics views.
// Safe to import from client components (no server-only imports).
export const CHANNELS = [
  { id: 'direct', label: 'Direct', tip: '주소창에 직접 입력, 즐겨찾기, 메신저·이메일·PDF 속 링크처럼 이전 사이트 정보가 없는 방문' },
  { id: 'naver', label: 'Naver', tip: '네이버 검색·블로그·카페, 네이버 앱 안의 브라우저, 네이버 검색광고 클릭' },
  { id: 'google', label: 'Google', tip: '구글 검색(국가별 구글 포함). 구글은 검색어를 전달하지 않습니다' },
  { id: 'daum_kakao', label: 'Daum·Kakao', tip: '다음 검색·카페, 카카오 서비스(카카오톡 대화방 링크는 제외)' },
  { id: 'kakaotalk', label: '카카오톡', tip: '카카오톡 대화방에 공유된 링크로 들어온 방문(카톡 안의 브라우저)' },
  { id: 'ai', label: 'AI 검색', tip: 'ChatGPT, Perplexity, Gemini, Copilot, Claude 등 AI 답변 속 링크로 들어온 방문' },
  { id: 'bing', label: 'Bing', tip: '마이크로소프트 Bing 검색(Windows·Edge 기본 검색)' },
  { id: 'yandex', label: 'Yandex', tip: '얀덱스 검색. 러시아·튀르키예·중앙아시아 고객 유입' },
  { id: 'other_search', label: '기타 검색엔진', tip: 'Yahoo, DuckDuckGo, Baidu, 줌, Ecosia 등 그 밖의 검색엔진' },
  { id: 'social', label: 'SNS', tip: '페이스북, 인스타그램, 링크드인, 유튜브, X, 스레드, 밴드 등' },
  { id: 'campaign', label: '캠페인 링크', tip: '홍보 링크에 붙인 utm 태그로 구분된 방문(뉴스레터, 전단 QR, 협력사 배너 등)' },
  { id: 'google_ads', label: 'Google 광고', tip: 'Google 광고(검색·디스플레이·유튜브 광고) 클릭' },
  { id: 'referral', label: '추천 경로', tip: '다른 웹사이트(거래처·협회·뉴스·블로그)에 걸린 링크로 들어온 방문. 검색엔진과 SNS는 제외' },
  { id: 'internal', label: '사이트 내 이동', tip: '홈페이지 안에서 페이지를 옮기다 새 방문으로 잡힌 경우(30분 이상 쉬었다 다시 클릭 등). 유입 경로 집계에서 제외' },
];
const CHANNEL_MAP = new Map(CHANNELS.map((channel) => [channel.id, channel]));
export const channelLabel = (id) => CHANNEL_MAP.get(id)?.label || id || '-';
export const channelTip = (id) => CHANNEL_MAP.get(id)?.tip || '';

// Visits recorded before the 14-route structure used broader channels; map them by their source.
const LEGACY = {
  search: { naver: 'naver', google: 'google', daum: 'daum_kakao', bing: 'bing', yandex: 'yandex' },
  ad: { 'naver-ads': 'naver', 'google-ads': 'google_ads', naver: 'naver', google: 'google_ads' },
  social: { 'naver-blog': 'naver', 'naver-cafe': 'naver', kakao: 'daum_kakao', tistory: 'referral', brunch: 'referral' },
};
const LEGACY_DEFAULT = { search: 'other_search', ad: 'campaign', social: 'social' };
export function normalizeChannel(channel, sourceName) {
  if (CHANNEL_MAP.has(channel)) return channel;
  if (LEGACY[channel]) return LEGACY[channel][sourceName] || LEGACY_DEFAULT[channel];
  return channel || 'direct';
}

export const SOURCE_NAMES = {
  'naver-search': '네이버 검색', 'naver-blog': '네이버 블로그', 'naver-cafe': '네이버 카페', 'naver-app': '네이버 앱', 'naver-ads': '네이버 검색광고', naver: '네이버',
  google: '구글 검색', 'google-ads': '구글 광고',
  daum: '다음 검색', 'daum-cafe': '다음 카페', kakao: '카카오', kakaotalk: '카카오톡',
  bing: 'Bing', yandex: 'Yandex', zum: '줌', yahoo: 'Yahoo', duckduckgo: 'DuckDuckGo', baidu: 'Baidu', ecosia: 'Ecosia',
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude', copilot: 'Copilot', wrtn: '뤼튼', 'naver-ai': '네이버 AI',
  band: '밴드', facebook: '페이스북', instagram: '인스타그램', youtube: '유튜브', linkedin: '링크드인', x: 'X(트위터)', threads: '스레드',
  tistory: '티스토리', brunch: '브런치',
};
export const sourceLabel = (name) => SOURCE_NAMES[name] || name || '-';
