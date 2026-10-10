'use client';

import { useState } from 'react';
import { Toggle, api, useToast } from '../admin-client';

const emptyBanner = { enabled: false, text: '', link: '', until: '' };

export default function SettingsPanel({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [banner, setBanner] = useState({ ...emptyBanner, ...initialSettings.site_banner });
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const savedBanner = { ...emptyBanner, ...settings.site_banner };
  const bannerDirty = JSON.stringify(banner) !== JSON.stringify(savedBanner);
  const setField = (key) => (event) => setBanner((value) => ({ ...value, [key]: event.target.value }));

  async function change(key, value, message) {
    setSaving(true);
    try {
      const next = (await api('/api/admin/settings', { method: 'PATCH', body: { key, value } })).settings;
      setSettings(next);
      if (key === 'site_banner') setBanner({ ...emptyBanner, ...next.site_banner });
      showToast(message);
      return true;
    } catch (error) { showToast(error.message, 'error'); return false; } finally { setSaving(false); }
  }

  return <>
    <section className="ac-card">
      <div className="ac-card-head"><h2>사이트 설정</h2><span>저장 후 1분 이내에 모든 방문자에게 적용됩니다.</span></div>
      <div className="ac-setting">
        <div><strong>다국어 전환 버튼 (PC)</strong><p>PC 화면 상단 메뉴의 한국어/English 전환 버튼을 표시합니다.</p></div>
        <Toggle checked={settings.language_visible !== false} disabled={saving} onChange={(on) => change('language_visible', on, on ? 'PC 다국어 버튼을 표시합니다.' : 'PC 다국어 버튼을 숨겼습니다.')} label={settings.language_visible !== false ? '표시' : '숨김'} />
      </div>
      <div className="ac-setting">
        <div><strong>다국어 전환 버튼 (모바일)</strong><p>모바일 햄버거 메뉴 안의 한국어/English 버튼을 표시합니다.</p></div>
        <Toggle checked={settings.language_mobile_visible !== false} disabled={saving} onChange={(on) => change('language_mobile_visible', on, on ? '모바일 다국어 버튼을 표시합니다.' : '모바일 다국어 버튼을 숨겼습니다.')} label={settings.language_mobile_visible !== false ? '표시' : '숨김'} />
      </div>
    </section>

    <section className="ac-card" id="banner">
      <div className="ac-card-head"><h2>상단 안내 배너</h2><span>{savedBanner.enabled ? (savedBanner.until ? `${savedBanner.until}까지 게시 중` : '게시 중') : '게시 안 함'}</span></div>
      <p className="ac-desc ac-gap">휴무·전시회 참가·긴급 공지처럼 모든 페이지 맨 위에 띄울 안내입니다. 방문자가 닫으면 내용이 바뀔 때까지 다시 보이지 않습니다.</p>
      <form className="ac-form" onSubmit={(event) => { event.preventDefault(); change('site_banner', banner, banner.enabled ? '배너를 게시했습니다.' : '배너 설정을 저장했습니다.'); }}>
        <label className="ac-field is-wide">배너 문구<input className="ac-input" value={banner.text} onChange={setField('text')} maxLength={200} placeholder="예: 10월 3일(금)~10월 9일(목) 추석 연휴 휴무 안내" /></label>
        <label className="ac-field">링크 (선택)<input className="ac-input" value={banner.link} onChange={setField('link')} placeholder="/notices 또는 https://…" /></label>
        <label className="ac-field">게시 종료일 (선택)<input className="ac-input" type="date" value={banner.until} onChange={setField('until')} /></label>
        <div className="ac-field is-wide ac-inline"><Toggle checked={banner.enabled} onChange={(enabled) => setBanner((value) => ({ ...value, enabled }))} label="사이트에 게시" /></div>
        {banner.text && <div className="ac-field is-wide"><span>미리보기</span><div className="ac-banner-preview"><span>{banner.text}</span>{banner.link && <u>자세히 보기 →</u>}<b aria-hidden="true">×</b></div></div>}
        <div className="ac-form-actions">
          {savedBanner.enabled && <button type="button" className="ac-btn is-danger" disabled={saving} onClick={() => change('site_banner', { ...savedBanner, enabled: false }, '배너를 내렸습니다.')}>지금 내리기</button>}
          <button className="ac-btn is-primary" disabled={saving || !bannerDirty}>{saving ? '저장 중' : '저장'}</button>
        </div>
      </form>
    </section>

    <section className="ac-card">
      <div className="ac-card-head"><h2>데이터 백업</h2><span>공지·영상·기술자료·문의·설정·활동 기록</span></div>
      <div className="ac-setting">
        <div><strong>전체 데이터 내려받기 (JSON)</strong><p>정기적으로 내려받아 보관하세요. 첨부파일 원본은 포함되지 않습니다.</p></div>
        <a className="ac-btn" href="/api/admin/backup">백업 파일 받기</a>
      </div>
    </section>
    {toast}
  </>;
}
