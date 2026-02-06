'use client';

import { useState } from 'react';

function parseBulk(text: string) {
  const lines = text.split(/\n+/).map((v) => v.trim()).filter(Boolean);
  return lines.map((line) => {
    const sep = line.includes('\t') ? '\t' : ',';
    const [en, uz, example, imageUrl] = line.split(sep).map((v) => v.trim());
    return { en, uz, example: example || `${en} misol gap`, imageUrl };
  });
}

export default function AddPage() {
  const [single, setSingle] = useState({ en: '', uz: '', example: '', imageUrl: '' });
  const [bulk, setBulk] = useState('');
  const [msg, setMsg] = useState('');

  const saveSingle = async () => {
    const r = await fetch('/api/cards', { method: 'POST', body: JSON.stringify(single) });
    setMsg(r.ok ? "So'z qo'shildi" : 'Xatolik');
  };

  const saveBulk = async () => {
    const items = parseBulk(bulk);
    const r = await fetch('/api/cards', { method: 'POST', body: JSON.stringify(items) });
    setMsg(r.ok ? `${items.length} ta so'z qo'shildi` : 'Xatolik');
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
        <h2 className="font-semibold">Bitta so'z qo'shish</h2>
        <input placeholder="English" value={single.en} onChange={(e) => setSingle({ ...single, en: e.target.value })} />
        <input placeholder="O'zbekcha" value={single.uz} onChange={(e) => setSingle({ ...single, uz: e.target.value })} />
        <textarea placeholder="Misol gap" value={single.example} onChange={(e) => setSingle({ ...single, example: e.target.value })} />
        <input placeholder="Rasm URL (ixtiyoriy)" value={single.imageUrl} onChange={(e) => setSingle({ ...single, imageUrl: e.target.value })} />
        <button className="bg-blue-600 text-white" onClick={saveSingle}>Saqlash</button>
      </section>
      <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
        <h2 className="font-semibold">CSV/TSV orqali ommaviy import</h2>
        <p className="text-sm">Format: en,uz,example,imageUrl yoki tab bilan ajratilgan.</p>
        <textarea className="min-h-48" value={bulk} onChange={(e) => setBulk(e.target.value)} />
        <button className="bg-indigo-600 text-white" onClick={saveBulk}>Bulk import</button>
      </section>
      {msg && <p>{msg}</p>}
    </div>
  );
}
