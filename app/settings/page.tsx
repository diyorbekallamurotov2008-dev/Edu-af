'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({ dailyGoal: 20, pronunciationPro: false, storeAudioForPro: false });
  const [json, setJson] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetch('/api/settings').then((r) => r.json()).then(setSettings); }, []);

  const save = async () => {
    const r = await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) });
    setMsg(r.ok ? 'Saqlandi' : 'Xatolik');
  };

  const backup = async () => {
    const data = await fetch('/api/export').then((r) => r.json());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tez-lugat-backup.json'; a.click();
  };

  const restore = async () => {
    const parsed = JSON.parse(json);
    const r = await fetch('/api/import', { method: 'POST', body: JSON.stringify(parsed) });
    setMsg(r.ok ? 'Import yakunlandi' : 'Import xato');
  };

  return (
    <div className="space-y-4">
      <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
        <h2 className="font-semibold">Foydalanuvchi sozlamalari</h2>
        <label>Kunlik maqsad<input type="number" value={settings.dailyGoal} onChange={(e) => setSettings({ ...settings, dailyGoal: Number(e.target.value) })} /></label>
        <label className="flex gap-2"><input type="checkbox" checked={settings.pronunciationPro} onChange={(e) => setSettings({ ...settings, pronunciationPro: e.target.checked })} /> Pro talaffuz rejimi</label>
        <label className="flex gap-2"><input type="checkbox" checked={settings.storeAudioForPro} onChange={(e) => setSettings({ ...settings, storeAudioForPro: e.target.checked })} /> Audio saqlashga ruxsat (faqat Pro)</label>
        <input placeholder="Azure Speech Key" value={settings.azureSpeechKey ?? ''} onChange={(e) => setSettings({ ...settings, azureSpeechKey: e.target.value })} />
        <input placeholder="Azure Region" value={settings.azureSpeechRegion ?? ''} onChange={(e) => setSettings({ ...settings, azureSpeechRegion: e.target.value })} />
        <button className="bg-blue-600 text-white" onClick={save}>Saqlash</button>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
        <h2 className="font-semibold">Backup eksport/import</h2>
        <button className="bg-emerald-600 text-white" onClick={backup}>JSON eksport</button>
        <textarea className="min-h-40" placeholder="Backup JSON ni shu yerga qo'ying" value={json} onChange={(e) => setJson(e.target.value)} />
        <button className="bg-indigo-600 text-white" onClick={restore}>JSON import</button>
      </section>
      {msg && <p>{msg}</p>}
    </div>
  );
}
