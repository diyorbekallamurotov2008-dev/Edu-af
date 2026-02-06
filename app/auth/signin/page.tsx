'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <div className="bg-white p-4 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">Kirish</h2>
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        const r = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' });
        if (r?.error) setMsg('Kirishda xatolik');
      }}>
        <input aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input aria-label="Parol" type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white" type="submit">Email + parol bilan kirish</button>
      </form>

      <button className="bg-indigo-600 text-white" onClick={() => signIn('email', { email, callbackUrl: '/dashboard' })}>Magic link yuborish</button>

      <details className="pt-2">
        <summary className="cursor-pointer">Ro'yxatdan o'tish</summary>
        <form className="space-y-2 mt-2" onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
          setMsg(res.ok ? "Ro'yxatdan o'tdingiz, endi kiring" : 'Xatolik yuz berdi');
        }}>
          <input placeholder="Ism" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="bg-emerald-600 text-white" type="submit">Akkaunt yaratish</button>
        </form>
      </details>

      {msg && <p>{msg}</p>}
    </div>
  );
}
