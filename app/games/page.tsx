'use client';

import { useEffect, useMemo, useState } from 'react';

type Card = { id: string; en: string; uz: string; example: string };

export default function GamesPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [msg, setMsg] = useState('');
  const [answer, setAnswer] = useState('');
  useEffect(() => { fetch('/api/cards').then((r) => r.json()).then(setCards); }, []);
  const sample = useMemo(() => cards.slice(0, 4), [cards]);
  const q = sample[0];

  if (!q) return <p className="bg-white p-4 rounded-xl">Mini-o‘yin uchun kamida 4 ta so‘z kerak.</p>;

  const options = [...sample].sort(() => Math.random() - 0.5).map((c) => c.en);

  return (
    <div className="space-y-4">
      <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
        <h2 className="font-semibold">1) Multiple choice</h2>
        <p>Ma'no: <strong>{q.uz}</strong></p>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => <button key={opt} className="bg-slate-100" onClick={() => setMsg(opt === q.en ? 'To‘g‘ri ✅' : `Noto‘g‘ri, javob: ${q.en}`)}>{opt}</button>)}
        </div>
      </section>
      <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
        <h2 className="font-semibold">2) Listening dictation</h2>
        <button className="bg-slate-200" onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(q.en))}>Eshitish</button>
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Eshitgan so'zni yozing" />
        <button className="bg-blue-600 text-white" onClick={() => setMsg(answer.trim().toLowerCase() === q.en.toLowerCase() ? 'To‘g‘ri ✅' : `Noto‘g‘ri, ${q.en}`)}>Tekshirish</button>
      </section>
      {msg && <p>{msg}</p>}
    </div>
  );
}
