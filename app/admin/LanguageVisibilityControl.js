'use client';

import { useEffect, useState } from 'react';
import styles from './language.module.css';

export default function LanguageVisibilityControl() {
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setVisible(!document.cookie.split('; ').includes('bmhf_language_visible=off')); }, []);
  async function toggle() {
    const next = !visible;
    setSaving(true);
    const response = await fetch('/api/admin/language', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visible: next }) });
    if (response.ok) setVisible(next);
    setSaving(false);
  }
  return <section className={`admin-note ${styles.control}`} id="language"><div><p className="kicker dark">LANGUAGE VISIBILITY</p><h2>다국어 전환 노출</h2><p>GNB의 국문·영문 전환 메뉴를 표시하거나 숨깁니다.</p></div><button type="button" className={`${styles.toggle} ${visible ? styles.on : ''}`} onClick={toggle} disabled={saving} aria-pressed={visible}><span aria-hidden="true" /><b>{visible ? '노출 ON' : '노출 OFF'}</b></button></section>;
}
