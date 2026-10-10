// First-party visitor analytics: classifies where visits come from (유입경로) and aggregates
// page views for the admin console. No IP addresses are stored.
import { CHANNELS, normalizeChannel } from './analytics-labels';
import { insert, list } from './store';

export { CHANNELS, channelLabel, channelTip, normalizeChannel, sourceLabel } from './analytics-labels';

const TABLE = 'page_views';
const KST = 9 * 3600 * 1000;
const DAY = 86400 * 1000;

// Referrer host rules, checked in this order: [pattern, channel, source name, search-term params].
// AI first (gemini.google.com, cue.search.naver.com would otherwise read as Google / Naver search).
const HOST_RULES = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, 'ai', 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'ai', 'perplexity'],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, 'ai', 'gemini'],
  [/(^|\.)claude\.ai$/, 'ai', 'claude'],
  [/(^|\.)copilot\.microsoft\.com$/, 'ai', 'copilot'],
  [/(^|\.)wrtn\.ai$/, 'ai', 'wrtn'],
  [/(^|\.)clova-x\.naver\.com$|(^|\.)cue\.search\.naver\.com$/, 'ai', 'naver-ai'],
  [/(^|\.)search\.naver\.com$/, 'naver', 'naver-search', ['query']],
  [/(^|\.)blog\.naver\.com$/, 'naver', 'naver-blog'],
  [/(^|\.)cafe\.naver\.com$/, 'naver', 'naver-cafe'],
  [/(^|\.)naver\.com$|(^|\.)naver\.me$/, 'naver', 'naver'],
  [/(^|\.)google\.[a-z.]+$/, 'google', 'google', ['q']],
  [/(^|\.)search\.daum\.net$/, 'daum_kakao', 'daum', ['q']],
  [/(^|\.)cafe\.daum\.net$/, 'daum_kakao', 'daum-cafe'],
  [/(^|\.)daum\.net$|(^|\.)kakao\.com$|(^|\.)kakaocdn\.net$/, 'daum_kakao', 'kakao'],
  [/(^|\.)bing\.com$/, 'bing', 'bing', ['q']],
  [/(^|\.)yandex\.[a-z.]+$|^ya\.ru$/, 'yandex', 'yandex', ['text']],
  [/(^|\.)search\.zum\.com$/, 'other_search', 'zum', ['query']],
  [/(^|\.)search\.yahoo\.[a-z.]+$|(^|\.)yahoo\.co\.jp$/, 'other_search', 'yahoo', ['p', 'q']],
  [/(^|\.)duckduckgo\.com$/, 'other_search', 'duckduckgo', ['q']],
  [/(^|\.)baidu\.com$/, 'other_search', 'baidu', ['wd', 'word']],
  [/(^|\.)ecosia\.org$/, 'other_search', 'ecosia', ['q']],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'social', 'facebook'],
  [/(^|\.)instagram\.com$/, 'social', 'instagram'],
  [/(^|\.)youtube\.com$|^youtu\.be$/, 'social', 'youtube'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'social', 'linkedin'],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, 'social', 'x'],
  [/(^|\.)threads\.net$/, 'social', 'threads'],
  [/(^|\.)band\.us$/, 'social', 'band'],
];
const PAID_MEDIUMS = /^(cpc|ppc|paid|paidsearch|paid_search|display|cpm|ad|ads|banner)$/i;

const text = (value, max) => { const result = String(value ?? '').trim().slice(0, max); return result || null; };
const hostOf = (url) => { try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };

// Decide the channel (접속 경로) of a session from its landing URL, referrer and browser.
// `internal` marks a session that started from another page of this site.
export function classify({ url, referrer, siteHost, ua = '', internal = false }) {
  let params;
  try { params = new URL(url, 'https://bmhf.local').searchParams; } catch { params = new URLSearchParams(); }
  const utm = Object.fromEntries(['source', 'medium', 'campaign', 'term', 'content'].map((key) => [`utm_${key}`, text(params.get(`utm_${key}`), 120)]));
  const host = hostOf(referrer);
  const external = host && host !== siteHost && !host.endsWith(`.${siteHost}`) && !/(^|\.)vercel\.app$|^localhost$/.test(host);
  const result = { channel: 'direct', source_name: null, search_term: null, referrer: external ? text(referrer, 500) : null, ...utm };
  const utmSource = (utm.utm_source || '').toLowerCase();

  // Paid clicks: Naver search ads add n_media/n_keyword, Google Ads adds gclid; UTM medium cpc etc.
  if (params.get('n_media') || params.get('n_keyword') || params.get('n_query')) return { ...result, channel: 'naver', source_name: 'naver-ads', search_term: text(params.get('n_keyword') || params.get('n_query'), 120) };
  if (params.get('gclid') || params.get('gad_source') || params.get('gbraid') || params.get('wbraid')) return { ...result, channel: 'google_ads', source_name: 'google-ads', search_term: utm.utm_term };
  if (utmSource && PAID_MEDIUMS.test(utm.utm_medium || '')) {
    if (utmSource.includes('google')) return { ...result, channel: 'google_ads', source_name: 'google-ads', search_term: utm.utm_term };
    if (utmSource.includes('naver')) return { ...result, channel: 'naver', source_name: 'naver-ads', search_term: utm.utm_term };
  }
  if (utmSource) return { ...result, channel: 'campaign', source_name: utmSource };

  if (external) {
    let refParams; try { refParams = new URL(referrer).searchParams; } catch { refParams = new URLSearchParams(); }
    for (const [pattern, channel, name, keys] of HOST_RULES) {
      if (pattern.test(host)) return { ...result, channel, source_name: name, search_term: keys ? text(keys.map((key) => refParams.get(key)).find(Boolean), 120) : null };
    }
    return { ...result, channel: 'referral', source_name: host };
  }
  // In-app browsers usually send no referrer: KakaoTalk chat links, the Naver app.
  if (/KAKAOTALK/i.test(ua)) return { ...result, channel: 'kakaotalk', source_name: 'kakaotalk' };
  if (/NAVER\(inapp/i.test(ua)) return { ...result, channel: 'naver', source_name: 'naver-app' };
  if (internal) return { ...result, channel: 'internal' };
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
    rows.push(...page.map((row) => ({ ...row, channel: normalizeChannel(row.channel, row.source_name) })));
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
  const touch = (item) => item.attribution?.session || item.attribution?.first || null;
  const inquiryChannel = (item) => { const value = touch(item); return value ? normalizeChannel(value.channel, value.source_name) : null; };

  // Trend: hourly for today, daily otherwise.
  const buckets = range.id === 'today'
    ? Array.from({ length: 24 }, (_, hour) => ({ key: String(hour), label: `${hour}시`, visitors: new Set(), views: 0, prevVisitors: new Set() }))
    : Array.from({ length: range.days }, (_, index) => { const day = kstDate(start.getTime() + index * DAY); return { key: day, label: day.slice(5).replace('-', '.'), visitors: new Set(), views: 0, prevVisitors: new Set() }; });
  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  for (const view of current) {
    const bucket = buckets[bucketIndex.get(range.id === 'today' ? String(kstHour(view.created_at)) : kstDate(view.created_at))];
    if (bucket) { bucket.views += 1; bucket.visitors.add(view.visitor_id); }
  }
  // Same position in the previous period (yesterday's hour, or the day N days earlier).
  for (const view of previous) {
    const index = range.id === 'today' ? kstHour(view.created_at) : Math.floor((new Date(view.created_at) - prevStart) / DAY);
    buckets[index]?.prevVisitors.add(view.visitor_id);
  }

  const sessions = cur.sessionList;
  // 사이트 내 이동 is not a way in: leave it out of the channel shares.
  const entries = sessions.filter((session) => session.channel !== 'internal');
  const channels = CHANNELS.filter((channel) => channel.id !== 'internal').map((channel) => {
    const count = entries.filter((session) => session.channel === channel.id).length;
    const prevCount = prev.sessionList.filter((session) => session.channel === channel.id).length;
    const leads = curInquiries.filter((item) => inquiryChannel(item) === channel.id).length;
    return { ...channel, sessions: count, previous: prevCount, share: entries.length ? count / entries.length : 0, inquiries: leads, conversion: count ? leads / count : 0 };
  }).filter((channel) => channel.sessions || channel.inquiries || channel.previous).sort((a, b) => b.sessions - a.sessions || b.previous - a.previous);
  const internalSessions = sessions.length - entries.length;

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
    trend: buckets.map((bucket) => ({ label: bucket.label, key: bucket.key, visitors: bucket.visitors.size, views: bucket.views, previous: bucket.prevVisitors.size })),
    channels, internalSessions,
    sources: countBy(entries.filter((session) => session.channel !== 'direct'), (session) => `${session.channel}|${session.source_name || ''}`, 12).map(({ name, count }) => { const [channel, source] = name.split('|'); return { channel, source, count }; }),
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
    leads: curInquiries.slice(0, 10).map((item) => ({ id: item.id, company: item.company_name, created_at: item.created_at, channel: inquiryChannel(item), source: touch(item)?.source_name || null, firstChannel: item.attribution?.first ? normalizeChannel(item.attribution.first.channel, item.attribution.first.source_name) : null, landing: item.attribution?.first?.landing || null })),
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
