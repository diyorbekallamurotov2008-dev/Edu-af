import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const now = new Date();
  const [total, due, mastered, streak, logs] = await Promise.all([
    prisma.card.count({ where: { userId: user.id } }),
    prisma.reviewState.count({ where: { userId: user.id, dueAt: { lte: now } } }),
    prisma.reviewState.count({ where: { userId: user.id, intervalDays: { gte: 21 }, repetitions: { gte: 4 } } }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
    prisma.reviewLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } })
  ]);

  const weeklyMap = new Map<string, { date: string; reviews: number; correct: number }>();
  logs.forEach((l) => {
    const date = l.createdAt.toISOString().slice(0, 10);
    if (!weeklyMap.has(date)) weeklyMap.set(date, { date, reviews: 0, correct: 0 });
    const i = weeklyMap.get(date)!;
    i.reviews += 1; if (l.correct) i.correct += 1;
  });

  return NextResponse.json({ total, due, mastered, streak: streak?.currentStreak ?? 0, chart: [...weeklyMap.values()].slice(-14).map((v) => ({ ...v, accuracy: v.reviews ? Math.round((v.correct / v.reviews) * 100) : 0 })) });
}
