'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Stats = { total: number; due: number; mastered: number; streak: number; chart: Array<{ date: string; reviews: number; accuracy: number }> };

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch('/api/stats').then((r) => r.json()).then(setStats); }, []);
  if (!stats) return <p>Yuklanmoqda...</p>;
  const box = 'bg-white rounded-xl p-4 shadow-sm';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={box}><p>Jami so'z</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className={box}><p>Bugun due</p><p className="text-2xl font-bold">{stats.due}</p></div>
        <div className={box}><p>Mastered</p><p className="text-2xl font-bold">{stats.mastered}</p></div>
        <div className={box}><p>Streak</p><p className="text-2xl font-bold">{stats.streak}</p></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm h-72">
        <h3 className="font-semibold mb-2">Haftalik ko'rsatkichlar</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="reviews" stroke="#2563eb" name="Takrorlash" />
            <Line type="monotone" dataKey="accuracy" stroke="#16a34a" name="Aniqlik %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
