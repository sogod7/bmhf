// Channel and source display names for the analytics views (safe to import from client components).
export const CHANNELS = [
  { id: 'search', label: '검색' },
  { id: 'ad', label: '광고' },
  { id: 'ai', label: 'AI 서비스' },
  { id: 'social', label: 'SNS·블로그' },
  { id: 'referral', label: '외부 사이트' },
  { id: 'campaign', label: '캠페인(UTM)' },
  { id: 'direct', label: '직접 방문' },
];
export const channelLabel = (id) => CHANNELS.find((channel) => channel.id === id)?.label || id || '-';

export const SOURCE_NAMES = {
  naver: '네이버', google: '구글', daum: '다음', bing: 'Bing', zum: '줌', yahoo: 'Yahoo', duckduckgo: 'DuckDuckGo', baidu: 'Baidu', yandex: 'Yandex', ecosia: 'Ecosia',
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude', copilot: 'Copilot', wrtn: '뤼튼', 'naver-ai': '네이버 AI',
  'naver-blog': '네이버 블로그', 'naver-cafe': '네이버 카페', band: '밴드', kakao: '카카오·다음', tistory: '티스토리', brunch: '브런치', facebook: '페이스북', instagram: '인스타그램', youtube: '유튜브', linkedin: '링크드인', x: 'X(트위터)', threads: '스레드',
  'naver-ads': '네이버 광고', 'google-ads': '구글 광고',
};
export const sourceLabel = (name) => SOURCE_NAMES[name] || name || '-';
