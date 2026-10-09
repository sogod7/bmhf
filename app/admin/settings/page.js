import { redirect } from 'next/navigation';
import { hasAdminSession, isAdminAuthConfigured } from '../../../lib/admin-auth';
import { formatDateTime } from '../../../lib/admin-constants';
import { getSettings, listActivity } from '../../../lib/site-settings';
import { storageMode } from '../../../lib/store';
import AdminShell from '../AdminShell';
import SettingsPanel from './SettingsPanel';

export const metadata = { title: '설정' };

export default async function AdminSettingsPage() {
  if (!await hasAdminSession()) redirect('/admin/login?next=/admin/settings');
  const [settings, activity] = await Promise.all([getSettings(), listActivity(30)]);
  const checks = [
    ['데이터 저장소', storageMode() === 'supabase', storageMode() === 'supabase' ? 'Supabase 연결됨' : 'Supabase 미연결: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요'],
    ['관리자 로그인', isAdminAuthConfigured(), isAdminAuthConfigured() ? '계정·세션 키 설정됨' : 'ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET 필요'],
    ['문의 알림 메일', Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFY_EMAIL), process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFY_EMAIL ? `${process.env.ADMIN_NOTIFY_EMAIL}(으)로 발송` : 'RESEND_API_KEY, ADMIN_NOTIFY_EMAIL 설정 시 새 문의를 메일로 알림'],
    ['방문 통계(GA4)', Boolean(process.env.NEXT_PUBLIC_GA_ID), process.env.NEXT_PUBLIC_GA_ID ? `측정 ID ${process.env.NEXT_PUBLIC_GA_ID}` : 'NEXT_PUBLIC_GA_ID 미설정'],
  ];
  return <AdminShell active="settings" kicker="SITE SETTINGS" title="설정" description="사이트 전체에 적용되는 설정과 시스템 연결 상태를 확인합니다.">
    <SettingsPanel initialSettings={settings} />
    <section className="ac-card">
      <div className="ac-card-head"><h2>시스템 상태</h2><span>환경변수는 Vercel 프로젝트 설정에서 변경합니다.</span></div>
      <ul className="ac-checks">{checks.map(([label, ok, detail]) => <li key={label} className={ok ? 'is-ok' : 'is-off'}><b aria-hidden="true">{ok ? '✓' : '!'}</b><div><strong>{label}</strong><span>{detail}</span></div></li>)}</ul>
    </section>
    <section className="ac-card" id="activity">
      <div className="ac-card-head"><h2>활동 기록</h2><span>최근 30건</span></div>
      {activity.length ? <ul className="ac-activity">{activity.map((item) => <li key={item.id}><span>{item.detail || item.action}</span><time>{formatDateTime(item.created_at)}</time></li>)}</ul> : <p className="ac-empty">기록된 활동이 없습니다.</p>}
    </section>
  </AdminShell>;
}
