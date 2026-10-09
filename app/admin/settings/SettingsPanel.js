'use client';

import { useState } from 'react';
import { Toggle, api, useToast } from '../admin-client';

export default function SettingsPanel({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  async function change(key, value, message) {
    setSaving(true);
    try { setSettings((await api('/api/admin/settings', { method: 'PATCH', body: { key, value } })).settings); showToast(message); } catch (error) { showToast(error.message, 'error'); } finally { setSaving(false); }
  }
  return <section className="ac-card">
    <div className="ac-card-head"><h2>사이트 설정</h2><span>저장 후 1분 이내에 모든 방문자에게 적용됩니다.</span></div>
    <div className="ac-setting">
      <div><strong>다국어 전환 메뉴</strong><p>상단 메뉴의 한국어/English 전환 버튼을 표시합니다.</p></div>
      <Toggle checked={settings.language_visible !== false} disabled={saving} onChange={(on) => change('language_visible', on, on ? '다국어 전환 메뉴를 표시합니다.' : '다국어 전환 메뉴를 숨겼습니다.')} label={settings.language_visible !== false ? '표시' : '숨김'} />
    </div>
    {toast}
  </section>;
}
