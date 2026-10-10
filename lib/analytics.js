// First-party visitor analytics: classifies where visits come from (유입경로) and aggregates
// page views for the admin console. No IP addresses are stored.
import { CHANNELS } from './analytics-labels';
import { insert, list } from './store';

export { CHANNELS, channelLabel, sourceLabel } from './analytics-labels';

const TABLE = 'page_views';
const KST = 9 * 3600 * 1000;
const DAY = 86400 * 1000;

// [host pattern, name, search-term query params]
const SEARCH_ENGINES = [
  [/(^|\.)search\.naver\.com$|^m\.search\.naver\.com$/, 'naver', ['query']],
  [/(^|\.)google\.[a-z.]+$/, 'google', ['q']],
  [/(^|\.)search\.daum\.net$/, 'daum', ['q']],
  [/(^|\.)bing\.com$/, 'bing', ['q']],
  [/(^|\.)search\.zum\.com$/, 'zum', ['query']],
  [/(^|\.)search\.yahoo\.[a-z.]+$|(^|\.)yahoo\.co\.jp$/, 'yahoo', ['p', 'q']],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo', ['q']],
  [/(^|\.)baidu\.com$/, 'baidu', ['wd', 'word']],
  [/(^|\.)yandex\.[a-z.]+$/, 'yandex', ['text']],
  [/(^|\.)ecosia\.org$/, 'ecosia', ['q']],
];
const AI_SERVICES = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, 'gemini'],
  [/(^|\.)claude\.ai$/, 'claude'],
  [/(^|\.)copilot\.microsoft\.com$/, 'copilot'],
  [/(^|\.)wrtn\.ai$/, 'wrtn'],
  [/(^|\.)clova-x\.naver\.com$|(^|\.)cue\.search\.naver\.com$/, 'naver-ai'],
];
const SOCIAL = [
  [/(^|\.)blog\.naver\.com$/, 'naver-blog'],
  [/(^|\.)cafe\.naver\.com$/, 'naver-cafe'],
  [/(^|\.)band\.us$/, 'band'],
  [/(^|\.)kakao\.com$|(^|\.)kakaocdn\.net$|(^|\.)daum\.net$/, 'kakao'],
  [/(^|\.)tistory\.com$/, 'tistory'],
  [/(^|\.)brunch\.co\.kr$/, 'brunch'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)youtube\.com$|^youtu\.be$/, 'youtube'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'linkedin'],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, 'x'],
  [/(^|\.)threads\.net$/, 'threads'],
];
const PAID_MEDIUMS = /^(cpc|ppc|paid|paidsearch|paid_search|display|cpm|ad|ads|banner)$/i;


const text = (value, max) => { const result = String(value ?? '').trim().slice(0, max); return result || null; };
const hostOf = (url) => { try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };

// Decide the channel of a session from its landing URL and referrer.
export function classify({ url, referrer, siteHost }) {
  let params;
  try { params = new URL(url, 'https://bmhf.local').searchParams; } catch { params = new URLSearchParams(); }
  const utm = Object.fromEntries(['source', 'medium', 'campaign', 'term', 'content'].map((key) => [`utm_${key}`, text(params.get(`utm_${key}`), 120)]));
  const host = hostOf(referrer);
  const external = host && host !== siteHost && !host.endsWith(`.${siteHost}`) && !/(^|\.)vercel\.app$|^localhost$/.test(host);
  const result = { channel: 'direct', source_name: null, search_term: null, referrer: external ? text(referrer, 500) : null, ...utm };

  // Paid clicks: Naver search ads add n_media/n_keyword, Google Ads adds gclid; UTM medium cpc etc.
  if (params.get('n_media') || params.get('n_keyword') || params.get('n_query')) return { ...result, channel: 'ad', source_name: 'naver-ads', search_term: text(params.get('n_keyword') || params.get('n_query'), 120) };
  if (params.get('gclid') || params.get('gad_source')) return { ...result, channel: 'ad', source_name: 'google-ads', search_term: utm.utm_term };
  if (utm.utm_source && PAID_MEDIUMS.test(utm.utm_medium || '')) return { ...result, channel: 'ad', source_name: utm.utm_source.toLowerCase(), search_term: utm.utm_term };

  if (external) {
    let refParams; try { refParams = new URL(referrer).searchParams; } catch { refParams = new URLSearchParams(); }
    // AI first: gemini.google.com / cue.search.naver.com would otherwise read as Google / Naver search.
    for (const [pattern, name] of AI_SERVICES) if (pattern.test(host)) return { ...result, channel: 'ai', source_name: name };
    for (const [pattern, name, keys] of SEARCH_ENGINES) if (pattern.test(host)) return { ...result, channel: 'search', source_name: name, search_term: text(keys.map((key) => refParams.get(key)).find(Boolean), 120) };
    for (const [pattern, name] of SOCIAL) if (pattern.test(host)) return { ...result, channel: 'social', source_name: name };
    if (!utm.utm_source) return { ...result, channel: 'referral', source_name: host };
  }
  if (utm.utm_source) return { ...result, channel: 'campaign', source_name: utm.utm_source.toLowerCase() };
  return result;
}

export function parseUserAgent(ua = '') {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? 'tablet' : /Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua) ? 'mobile' : 'desktop';
  const browser = /SamsungBrowser/i.test(ua) ? 'Samsung Internet' : /NAVER\(inapp|Whale/i.test(ua) ? (/Whale/i.test(ua) ? 'Whale' : '네이버 앱') : /KAKAOTALK/i.test(ua) ? '카카오톡' : /Edg\//i.test(ua) ? 'Edge' : /OPR\/|Opera/i.test(ua) ? 'Opera' : /Firefox|FxiOS/i.test(ua) ? 'Firefox' : /CriOS|Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : '기타';
  const os = /Windows/i.test(ua) ? 'Windows' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android' : /Mac OS X|Macintosh/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : '기타';
  return { device, browser, os };
}

export const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|outbrain|pinterest|vkshare|w3c_validator|headless|lighthouse|pagespeed|gtmetrix|python-requests|curl\/|wget|axios|node-fetch|phantomjs|selenium|puppeteer|playwright|yeti|daum(oa)?|petalbot|semrush|ahrefs|mj12/i;

export async function recordView(input) {
  return insert(TABLE, input);
}

// ---- Reporting ----

const kstDate = (value) => new Date(new Date(value).getTime() + KST).toISOString().slice(0, 10);
const kstHour = (value) => new Date(new Date(value).getTime() + KST).getUTCHours();
// Start of a KST calendar day, as a UTC Date.
const kstMidnight = (date) => new Date(Date.parse(`${kstDate(date)}T00:00:00Z`) - KST);

export const RANGES = [
  { id: 'today', label: '오늘', days: 1 },
  { id: '7d', label: '7일', days: 7 },
  { id: '30d', label: '30일', days: 30 },
  { id: '90d', label: '90일', days: 90 },
];

const COLUMNS = 'created_at,visitor_id,session_id,is_landing,path,title,channel,source_name,referrer,search_term,utm_source,utm_medium,utm_campaign,device,browser,os,country,city';

async function viewsBetween(from, to) {
  const rows = [];
  for (let offset = 0; offset < 200000; offset += 1000) {
    const page = await list(TABLE, { gte: { created_at: from.toISOString() }, lt: { created_at: to.toISOString() }, order: [{ column: 'created_at' }], limit: 1000, offset, select: COLUMNS });
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}

// Show Korean search words instead of %EA%B3%A0… in referrer URLs (decode before any truncation).
const readableUrl = (value) => { try { return decodeURIComponent(value.replace(/\+/g, ' ')); } catch { return value; } };

const countBy = (items, key, limit = 10) => {
  const counts = new Map();
  for (const item of items) { const value = typeof key === 'function' ? key(item) : item[key]; if (value == null || value === '') continue; counts.set(value, (counts.get(value) || 0) + 1); }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, limit);
};

function summarize(views) {
  const sessions = new Map();
  for (const view of views) {
    const session = sessions.get(view.session_id);
    if (!session) sessions.set(view.session_id, { ...view, pages: 1, landing: view.path, started: view.created_at, last: view.created_at });
    else { session.pages += 1; session.last = view.created_at; }
  }
  const list = [...sessions.values()];
  const visitors = new Set(views.map((view) => view.visitor_id)).size;
  const bounces = list.filter((session) => session.pages === 1).length;
  const duration = list.filter((session) => session.pages > 1).map((session) => new Date(session.last) - new Date(session.started));
  return {
    views: views.length, visitors, sessions: list.length,
    pagesPerSession: list.length ? views.length / list.length : 0,
    bounceRate: list.length ? bounces / list.length : 0,
    avgDuration: duration.length ? duration.reduce((sum, ms) => sum + ms, 0) / duration.length : 0,
    sessionList: list,
  };
}

export async function analyticsReport(rangeId = '7d', inquiries = []) {
  const range = RANGES.find((item) => item.id === rangeId) || RANGES[1];
  const now = new Date();
  const start = new Date(kstMidnight(now).getTime() - (range.days - 1) * DAY);
  const prevStart = new Date(start.getTime() - range.days * DAY);
  const all = await viewsBetween(prevStart, now);
  const current = all.filter((view) => new Date(view.created_at) >= start);
  const previous = all.filter((view) => new Date(view.created_at) < start);
  const cur = summarize(current); const prev = summarize(previous);

  const inRange = (from, to) => inquiries.filter((item) => { const at = new Date(item.created_at); return at >= from && at < to; });
  const curInquiries = inRange(start, now); const prevInquiries = inRange(prevStart, start);
  const inquiryChannel = (item) => item.attribution?.session?.channel || item.attribution?.first?.channel || null;

  // Trend: hourly for today, daily otherwise.
  const buckets = range.id === 'today'
    ? Array.from({ length: 24 }, (_, hour) => ({ key: String(hour), label: `${hour}시`, visitors: new Set(), views: 0 }))
    : Array.from({ length: range.days }, (_, index) => { const day = kstDate(start.getTime() + index * DAY); return { key: day, label: day.slice(5).replace('-', '.'), visitors: new Set(), views: 0 }; });
  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  for (const view of current) {
    const bucket = buckets[bucketIndex.get(range.id === 'today' ? String(kstHour(view.created_at)) : kstDate(view.created_at))];
    if (bucket) { bucket.views += 1; bucket.visitors.add(view.visitor_id); }
  }

  const sessions = cur.sessionList;
  const channels = CHANNELS.map((channel) => {
    const count = sessions.filter((session) => session.channel === channel.id).length;
    const leads = curInquiries.filter((item) => inquiryChannel(item) === channel.id).length;
    return { ...channel, sessions: count, share: sessions.length ? count / sessions.length : 0, inquiries: leads, conversion: count ? leads / count : 0 };
  }).filter((channel) => channel.sessions || channel.inquiries).sort((a, b) => b.sessions - a.sessions);

  const pageStats = new Map();
  for (const view of current) {
    const stat = pageStats.get(view.path) || { path: view.path, title: view.title, views: 0, visitors: new Set() };
    stat.views += 1; stat.visitors.add(view.visitor_id); if (view.title) stat.title = view.title;
    pageStats.set(view.path, stat);
  }

  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, views: 0 }));
  for (const view of current) hours[kstHour(view.created_at)].views += 1;

  return {
    range, start: start.toISOString(), end: now.toISOString(),
    totals: { ...pick(cur), inquiries: curInquiries.length, conversion: cur.sessions ? curInquiries.length / cur.sessions : 0 },
    previous: { ...pick(prev), inquiries: prevInquiries.length, conversion: prev.sessions ? prevInquiries.length / prev.sessions : 0 },
    trend: buckets.map((bucket) => ({ label: bucket.label, key: bucket.key, visitors: bucket.visitors.size, views: bucket.views })),
    channels,
    sources: countBy(sessions.filter((session) => session.channel !== 'direct'), (session) => `${session.channel}|${session.source_name || ''}`, 12).map(({ name, count }) => { const [channel, source] = name.split('|'); return { channel, source, count }; }),
    searchTerms: countBy(sessions, 'search_term', 12),
    campaigns: countBy(sessions.filter((session) => session.utm_source || session.utm_campaign), (session) => [session.utm_source, session.utm_medium, session.utm_campaign].map((value) => value || '-').join(' / '), 10),
    referrers: countBy(sessions.filter((session) => session.referrer), (session) => readableUrl(session.referrer).replace(/^https?:\/\//, '').replace(/^www\./, '').slice(0, 90), 10),
    pages: [...pageStats.values()].map((stat) => ({ path: stat.path, title: stat.title, views: stat.views, visitors: stat.visitors.size })).sort((a, b) => b.views - a.views).slice(0, 12),
    landings: countBy(sessions, 'landing', 10),
    devices: countBy(sessions, 'device', 5),
    browsers: countBy(sessions, 'browser', 6),
    os: countBy(sessions, 'os', 6),
    locations: countBy(sessions, (session) => (session.country ? `${session.country}${session.city ? ` · ${session.city}` : ''}` : null), 8),
    hours,
    recent: sessions.slice().sort((a, b) => new Date(b.started) - new Date(a.started)).slice(0, 25).map((session) => ({ started: session.started, landing: session.landing, pages: session.pages, channel: session.channel, source: session.source_name, searchTerm: session.search_term, device: session.device, browser: session.browser, location: session.country ? `${session.country}${session.city ? ` · ${session.city}` : ''}` : null })),
    leads: curInquiries.slice(0, 10).map((item) => ({ id: item.id, company: item.company_name, created_at: item.created_at, channel: inquiryChannel(item), source: item.attribution?.session?.source_name || item.attribution?.first?.source_name || null, firstChannel: item.attribution?.first?.channel || null, landing: item.attribution?.first?.landing || null })),
  };
}

function pick(summary) {
  const { views, visitors, sessions, pagesPerSession, bounceRate, avgDuration } = summary;
  return { views, visitors, sessions, pagesPerSession, bounceRate, avgDuration };
}

// Small headline numbers for the dashboard.
export async function visitorSnapshot() {
  const now = new Date();
  const today = kstMidnight(now);
  const weekStart = new Date(today.getTime() - 6 * DAY);
  const views = await viewsBetween(weekStart, now);
  const todayViews = views.filter((view) => new Date(view.created_at) >= today);
  return { todayVisitors: new Set(todayViews.map((view) => view.visitor_id)).size, todayViews: todayViews.length, weekVisitors: new Set(views.map((view) => view.visitor_id)).size, weekViews: views.length };
}
