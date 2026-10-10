import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../../lib/admin-auth';
import { formatDateTime } from '../../../lib/admin-constants';
import { RANGES, analyticsReport, channelLabel, channelTip, sourceLabel } from '../../../lib/analytics';
import { listInquiries } from '../../../lib/inquiries';
import AdminChart from '../AdminChart';
import AdminShell from '../AdminShell';
import Help from '../Help';

export const metadata = { title: '접속 통계' };

const number = (value) => Math.round(value).toLocaleString('ko-KR');
const percent = (value) => `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`;
const duration = (ms) => { const seconds = Math.round(ms / 1000); return seconds < 60 ? `${seconds}초` : `${Math.floor(seconds / 60)}분 ${seconds % 60}초`; };
const DEVICE = { mobile: '모바일', tablet: '태블릿', desktop: 'PC' };

// Change versus the previous period of the same length. `lowerIsBetter` flips the good/bad tone.
function Delta({ now, before, lowerIsBetter = false }) {
  if (!before && !now) return <small className="an-delta">변화 없음</small>;
  if (!before) return <small className="an-delta is-up">▲ 신규</small>;
  const change = (now - before) / before;
  if (Math.abs(change) < 0.005) return <small className="an-delta">이전과 같음</small>;
  const good = lowerIsBetter ? change < 0 : change > 0;
  return <small className={`an-delta ${good ? 'is-up' : 'is-down'}`}>{change > 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(0)}% <span>이전 기간 대비</span></small>;
}

// Ranked list with a single-hue magnitude bar behind each row.
function Ranking({ rows, empty = '데이터가 없습니다.', valueLabel = '방문' }) {
  if (!rows.length) return <p className="ac-empty">{empty}</p>;
  const max = Math.max(...rows.map((row) => row.value));
  return <ol className="an-rank">{rows.map((row) => <li key={row.key} title={row.tip ? undefined : `${row.label} · ${valueLabel} ${number(row.value)}`}>
    <span className="an-rank-bar" style={{ width: `${(row.value / max) * 100}%` }} aria-hidden="true" />
    <span className="an-rank-label"><span className="an-rank-text">{row.label}{row.sub && <small>{row.sub}</small>}</span><Help text={row.tip} /></span>
    <b>{number(row.value)}</b>
  </li>)}</ol>;
}

export default async function AdminAnalyticsPage({ searchParams }) {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/analytics');
  const { range: rangeId = '7d' } = await searchParams;
  const inquiries = await listInquiries().catch(() => []);
  let report = null; let problem = null;
  try { report = await analyticsReport(rangeId, inquiries); } catch (error) { problem = error.message; }

  const tabs = <nav className="ac-tabs" aria-label="기간">{RANGES.map((range) => <Link key={range.id} href={`/admin/analytics?range=${range.id}`} className={(report?.range.id || rangeId) === range.id ? 'is-active' : undefined} aria-current={(report?.range.id || rangeId) === range.id ? 'page' : undefined}>{range.label}</Link>)}</nav>;

  if (!report) {
    return <AdminShell active="analytics" kicker="VISITOR ANALYTICS" title="접속 통계" description="방문자 수, 유입 경로, 인기 페이지와 문의 전환을 확인합니다." actions={tabs}>
      <p className="ac-banner is-warn">접속 통계 테이블을 읽지 못했습니다. Supabase SQL Editor에서 <b>supabase/migrations/20261010_bmhf_analytics.sql</b>을 실행해 주세요.<br /><small>{problem}</small></p>
    </AdminShell>;
  }

  const { totals: t, previous: p } = report;
  const tiles = [
    ['방문자', number(t.visitors), <Delta key="d" now={t.visitors} before={p.visitors} />, '중복 없는 방문자 수'],
    ['방문 수', number(t.sessions), <Delta key="d" now={t.sessions} before={p.sessions} />, '30분 이상 쉬면 새 방문'],
    ['페이지뷰', number(t.views), <Delta key="d" now={t.views} before={p.views} />, `방문당 ${t.pagesPerSession.toFixed(1)}페이지`],
    ['이탈률', percent(t.bounceRate), <Delta key="d" now={t.bounceRate} before={p.bounceRate} lowerIsBetter />, '한 페이지만 보고 나간 비율'],
    ['평균 체류', duration(t.avgDuration), <Delta key="d" now={t.avgDuration} before={p.avgDuration} />, '2페이지 이상 본 방문 기준'],
    ['문의 전환', `${number(t.inquiries)}건`, <Delta key="d" now={t.inquiries} before={p.inquiries} />, `방문 대비 ${percent(t.conversion)}`],
  ];
  const hasData = t.views > 0;
  const periodText = report.range.id === 'today' ? '오늘' : `최근 ${report.range.days}일`;

  return <AdminShell active="analytics" kicker="VISITOR ANALYTICS" title="접속 통계" description={`${periodText} 방문 현황입니다. 검색·광고·SNS·AI 서비스 등 유입 경로별 방문과 문의 전환을 확인합니다. 관리자 본인의 방문과 검색엔진 로봇은 제외됩니다.`} actions={tabs}>
    <section className="an-tiles">
      {tiles.map(([label, value, delta, hint]) => <div key={label} className="ac-stat an-tile"><span>{label}</span><strong>{value}</strong>{delta}<small>{hint}</small></div>)}
    </section>

    {!hasData && <p className="ac-banner">아직 {periodText} 동안 수집된 방문 기록이 없습니다. 통계는 이 기능을 배포한 시점부터 쌓입니다.</p>}

    <section className="ac-card">
      <div className="ac-card-head"><h2>{report.range.id === 'today' ? '시간대별 방문자 (오늘)' : '일별 방문자 추이'}</h2><span>그래프에 마우스를 올리거나 탭하면 수치가 보입니다</span></div>
      <AdminChart type="line" unit="명" seriesName={report.range.id === 'today' ? '오늘' : '이번 기간'} compareName={report.range.id === 'today' ? '어제' : '이전 기간'} ariaLabel={`${periodText} 방문자 추이`}
        points={report.trend.map((bucket) => ({ label: bucket.label, value: bucket.visitors, compare: bucket.previous, details: [['페이지뷰', number(bucket.views)]] }))} />
    </section>

    <section className="ac-card">
      <div className="ac-card-head"><h2>접속 경로별 트래픽</h2><span>방문(세션) 기준 · 문의 전환은 문의한 방문자의 접속 경로 기준</span></div>
      {report.channels.length ? <div className="an-table-wrap"><table className="an-table">
        <thead><tr><th>접속 경로</th><th className="is-num">방문</th><th>비율</th><th className="is-num">이전 기간</th><th className="is-num">문의</th><th className="is-num">전환율</th></tr></thead>
        <tbody>{report.channels.map((channel) => <tr key={channel.id}>
          <td className="an-nowrap">{channel.label}<Help text={channel.tip} /></td><td className="is-num">{number(channel.sessions)}</td>
          <td><span className="an-share"><i style={{ width: `${channel.share * 100}%` }} /></span><small>{percent(channel.share)}</small></td>
          <td className="is-num an-muted">{number(channel.previous)}</td>
          <td className="is-num">{channel.inquiries || '-'}</td><td className="is-num">{channel.sessions ? percent(channel.conversion) : '-'}</td>
        </tr>)}</tbody>
      </table></div> : <p className="ac-empty">데이터가 없습니다.</p>}
      {report.internalSessions > 0 && <p className="an-note">사이트 내 이동 {number(report.internalSessions)}건은 접속 경로 집계에서 제외했습니다.<Help text={channelTip('internal')} /></p>}
    </section>

    <div className="ac-grid-2">
      <section className="ac-card">
        <div className="ac-card-head"><h2>접속 경로 TOP</h2><span>세부 출처 · Direct 제외</span></div>
        <Ranking rows={report.sources.map((row) => ({ key: `${row.channel}${row.source}`, label: sourceLabel(row.source), sub: channelLabel(row.channel), tip: channelTip(row.channel), value: row.count }))} empty="외부에서 들어온 방문이 없습니다." />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>검색어 · 광고 키워드</h2><span>네이버·다음 등 검색어가 전달된 경우</span></div>
        <Ranking rows={report.searchTerms.map((row) => ({ key: row.name, label: row.name, value: row.count }))} empty="수집된 검색어가 없습니다. (구글은 검색어를 전달하지 않습니다)" />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>유입 페이지 (외부 링크)</h2><span>방문자가 클릭한 외부 페이지 주소</span></div>
        <Ranking rows={report.referrers.map((row) => ({ key: row.name, label: row.name, value: row.count }))} empty="외부 링크 유입이 없습니다." />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>캠페인 (UTM)</h2><span>source / medium / campaign</span></div>
        <Ranking rows={report.campaigns.map((row) => ({ key: row.name, label: row.name, value: row.count }))} empty="UTM 태그가 붙은 방문이 없습니다." />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>인기 페이지</h2><span>페이지뷰 · 방문자</span></div>
        <Ranking valueLabel="페이지뷰" rows={report.pages.map((row) => ({ key: row.path, label: row.title?.split('|')[0].trim() || row.path, sub: `${row.path} · 방문자 ${number(row.visitors)}명`, value: row.views }))} />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>첫 방문 페이지</h2><span>방문이 시작된 페이지</span></div>
        <Ranking rows={report.landings.map((row) => ({ key: row.name, label: row.name, value: row.count }))} />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>기기 · 브라우저</h2></div>
        <Ranking rows={[...report.devices.map((row) => ({ key: `d${row.name}`, label: DEVICE[row.name] || row.name, sub: '기기', value: row.count })), ...report.browsers.map((row) => ({ key: `b${row.name}`, label: row.name, sub: '브라우저', value: row.count }))]} />
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>지역</h2><span>국가 · 도시 (IP는 저장하지 않음)</span></div>
        <Ranking rows={report.locations.map((row) => ({ key: row.name, label: row.name, value: row.count }))} empty="지역 정보가 없습니다. (운영 서버에서만 수집됩니다)" />
      </section>
    </div>

    <section className="ac-card">
      <div className="ac-card-head"><h2>시간대별 페이지뷰</h2><span>한국 시간 기준 · {periodText} 합계</span></div>
      <AdminChart type="bar" seriesName="페이지뷰" height={180} ariaLabel="시간대별 페이지뷰" points={report.hours.map((hour) => ({ label: `${hour.hour}시`, title: `${hour.hour}:00 – ${hour.hour}:59`, value: hour.views }))} />
    </section>

    {report.leads.length > 0 && <section className="ac-card">
      <div className="ac-card-head"><h2>문의 고객의 유입 경로</h2><Link href="/admin/inquiries">문의 관리 →</Link></div>
      <div className="an-table-wrap"><table className="an-table">
        <thead><tr><th>접수</th><th>회사</th><th>이번 방문 경로</th><th>첫 방문 경로</th><th>첫 방문 페이지</th></tr></thead>
        <tbody>{report.leads.map((lead) => <tr key={lead.id}>
          <td>{formatDateTime(lead.created_at)}</td><td><Link href={`/admin/inquiries?id=${lead.id}`}>{lead.company}</Link></td>
          <td>{lead.channel ? `${channelLabel(lead.channel)}${lead.source ? ` · ${sourceLabel(lead.source)}` : ''}` : '기록 없음'}</td>
          <td>{lead.firstChannel ? channelLabel(lead.firstChannel) : '-'}</td><td>{lead.landing || '-'}</td>
        </tr>)}</tbody>
      </table></div>
    </section>}

    <section className="ac-card">
      <div className="ac-card-head"><h2>최근 방문</h2><span>최근 25건</span></div>
      {report.recent.length ? <div className="an-table-wrap"><table className="an-table">
        <thead><tr><th>시작</th><th>유입 경로</th><th>첫 페이지</th><th className="is-num">페이지</th><th>기기</th><th>지역</th></tr></thead>
        <tbody>{report.recent.map((visit, index) => <tr key={`${visit.started}${index}`}>
          <td>{formatDateTime(visit.started)}</td>
          <td>{channelLabel(visit.channel)}{visit.source && ` · ${sourceLabel(visit.source)}`}{visit.searchTerm && <small> “{visit.searchTerm}”</small>}</td>
          <td>{visit.landing}</td><td className="is-num">{visit.pages}</td>
          <td>{DEVICE[visit.device] || visit.device} · {visit.browser}</td><td>{visit.location || '-'}</td>
        </tr>)}</tbody>
      </table></div> : <p className="ac-empty">방문 기록이 없습니다.</p>}
    </section>
  </AdminShell>;
}
