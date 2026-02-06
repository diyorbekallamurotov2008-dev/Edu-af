'use client';

import { useEffect, useMemo, useState } from 'react';

type Item = { cardId: string; wrongCount: number; card: { en: string; uz: string; example: string; imageUrl?: string } };

export default function ReviewPage() {
  const [queue, setQueue] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const current = useMemo(() => queue[idx], [queue, idx]);

  useEffect(() => { fetch('/api/review').then((r) => r.json()).then(setQueue); }, []);

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    speechSynthesis.speak(utt);
  };

  const checkPronunciation = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert('Brauzer SpeechRecognition qo‘llamaydi');
    const rec = new SR(); rec.lang = 'en-US';
    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      const res = await fetch('/api/pronunciation/basic', { method: 'POST', body: JSON.stringify({ expected: current?.card.en, transcript }) }).then((r) => r.json());
      alert(res.match ? 'Talaffuz mos keldi' : `Farq bor: ${transcript}`);
    };
    rec.start();
  };

  const submit = async (grade: number) => {
    if (!current) return;
    const r = await fetch('/api/review', { method: 'POST', body: JSON.stringify({ cardId: current.cardId, typedAnswer: answer, grade }) }).then((x) => x.json());
    setFeedback(r.correct ? 'To‘g‘ri ✅' : `Noto‘g‘ri ❌ To'g'risi: ${r.expected}`);
    setAnswer('');
    setIdx((v) => v + 1);
  };

  if (!current) return <p className="bg-white p-4 rounded-xl">Navbat bo‘sh. Yangi so‘z qo‘shing yoki keyinroq keling.</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
      <p className="text-sm text-slate-500">{idx + 1}/{queue.length}</p>
      <p className="text-xl font-semibold">{current.card.uz}</p>
      <p className="text-sm">Misol: {current.card.example}</p>
      <input aria-label="Javob" placeholder="Inglizchasini yozing" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit(4)} />
      <div className="flex flex-wrap gap-2">
        <button className="bg-slate-200" onClick={() => speak(current.card.en)}>So'zni eshitish</button>
        <button className="bg-slate-200" onClick={() => speak(current.card.example)}>Gapni eshitish</button>
        <button className="bg-amber-500 text-white" onClick={checkPronunciation}>Talaffuzni tekshirish (Basic)</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="bg-red-600 text-white" onClick={() => submit(0)}>Again (0)</button>
        <button className="bg-orange-600 text-white" onClick={() => submit(3)}>Hard (3)</button>
        <button className="bg-blue-600 text-white" onClick={() => submit(4)}>Good (4)</button>
        <button className="bg-green-600 text-white" onClick={() => submit(5)}>Easy (5)</button>
      </div>
      {feedback && <p aria-live="polite">{feedback}</p>}
    </div>
  );
}
