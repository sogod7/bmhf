import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../lib/admin-auth';
import { INQUIRY_STATUSES, formatDateTime, inquiryStatusLabel } from '../../lib/admin-constants';
import { inquiryStats } from '../../lib/inquiries';
import { listNotices } from '../../lib/notices-server';
import { listResources } from '../../lib/resources';
import { listActivity } from '../../lib/site-settings';
import { listVideos } from '../../lib/videos-server';
import AdminShell from './AdminShell';

const safe = (promise, fallback) => promise.catch(() => fallback);

export default async function AdminDashboard() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin');
  const [stats, notices, videos, resources, activity] = await Promise.all([
    safe(inquiryStats(), { total: 0, byStatus: {}, last7: 0, last30: 0, daily: [], recent: [] }),
    safe(listNotices(), []), safe(listVideos(), []), safe(listResources(), []), listActivity(8),
  ]);
  const maxDaily = Math.max(1, ...stats.daily.map((day) => day.count));
  const downloads = resources.reduce((sum, item) => sum + (item.download_count || 0), 0);
  const cards = [
    ['신규 문의', stats.byStatus.new || 0, '확인 대기', '/admin/inquiries?status=new', 'is-accent'],
    ['진행 중 문의', stats.byStatus.in_progress || 0, `최근 7일 접수 ${stats.last7}건`, '/admin/inquiries?status=in_progress'],
    ['공개 공지', notices.filter((item) => item.visible).length, `고정 ${notices.filter((item) => item.pinned && item.visible).length}건 · 전체 ${notices.length}건`, '/admin/notices'],
    ['공개 영상', videos.filter((item) => item.visible).length, `전체 ${videos.length}건`, '/admin/videos'],
    ['기술자료', resources.filter((item) => item.status === 'published').length, `누적 다운로드 ${downloads.toLocaleString('ko-KR')}회`, '/admin/resources'],
  ];
  return <AdminShell active="dashboard" kicker="OPERATIONS CONSOLE" title="운영 현황" description="고객 문의와 웹사이트 콘텐츠 현황을 한눈에 확인합니다."
    actions={<><Link className="ac-btn" href="/admin/notices?new=1">공지 작성</Link><Link className="ac-btn is-primary" href="/admin/inquiries">문의 확인</Link></>}>
    <section className="ac-stats">
      {cards.map(([label, value, hint, href, tone]) => <Link key={label} href={href} className={`ac-stat ${tone || ''}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></Link>)}
    </section>
    <div className="ac-grid-2">
      <section className="ac-card">
        <div className="ac-card-head"><h2>최근 14일 문의 접수</h2><span>30일 {stats.last30}건 · 누적 {stats.total}건</span></div>
        <div className="ac-chart" role="img" aria-label={`최근 14일 문의 ${stats.daily.reduce((sum, day) => sum + day.count, 0)}건`}>
          {stats.daily.map((day) => <div key={day.day} className="ac-bar" title={`${day.day} · ${day.count}건`}><i style={{ height: `${(day.count / maxDaily) * 100}%` }} /><span>{day.day.slice(8)}</span>{day.count > 0 && <b>{day.count}</b>}</div>)}
        </div>
        <ul className="ac-status-row">{INQUIRY_STATUSES.map((status) => <li key={status.id}><span className={`ac-badge tone-${status.tone}`}>{status.label}</span><b>{stats.byStatus[status.id] || 0}</b></li>)}</ul>
      </section>
      <section className="ac-card">
        <div className="ac-card-head"><h2>최근 문의</h2><Link href="/admin/inquiries">전체 보기 →</Link></div>
        {stats.recent.length ? <ul className="ac-list">{stats.recent.map((item) => <li key={item.id}><Link href={`/admin/inquiries?id=${item.id}`}><strong>{item.company_name}</strong><span>{item.contact_name} · {item.category}</span></Link><div><span className={`ac-badge tone-${INQUIRY_STATUSES.find((status) => status.id === item.status)?.tone}`}>{inquiryStatusLabel(item.status)}</span><time>{formatDateTime(item.created_at)}</time></div></li>)}</ul> : <p className="ac-empty">아직 접수된 문의가 없습니다.</p>}
      </section>
    </div>
    <section className="ac-card">
      <div className="ac-card-head"><h2>최근 활동</h2><Link href="/admin/settings#activity">기록 더 보기 →</Link></div>
      {activity.length ? <ul className="ac-activity">{activity.map((item) => <li key={item.id}><span>{item.detail || item.action}</span><time>{formatDateTime(item.created_at)}</time></li>)}</ul> : <p className="ac-empty">기록된 활동이 없습니다.</p>}
    </section>
  </AdminShell>;
}
