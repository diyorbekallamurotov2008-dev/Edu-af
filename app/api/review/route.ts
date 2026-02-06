import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-user';
import { prisma } from '@/lib/prisma';
import { normalizeText } from '@/lib/normalize';
import { nextSm2 } from '@/lib/sm2';
import { reviewSchema } from '@/lib/validators';

export async function GET() {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const now = new Date();
  const due = await prisma.reviewState.findMany({
    where: { userId: user.id, dueAt: { lte: now } },
    include: { card: true },
    orderBy: [{ dueAt: 'asc' }, { wrongCount: 'desc' }],
    take: 30
  });
  if (due.length) return NextResponse.json(due);
  const hardest = await prisma.reviewState.findMany({ where: { userId: user.id }, include: { card: true }, orderBy: [{ wrongCount: 'desc' }, { dueAt: 'asc' }], take: 30 });
  return NextResponse.json(hardest);
}

export async function POST(req: Request) {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const body = reviewSchema.parse(await req.json());
  const state = await prisma.reviewState.findUniqueOrThrow({ where: { cardId: body.cardId }, include: { card: true } });
  const correct = normalizeText(body.typedAnswer) === normalizeText(state.card.en);
  const updated = nextSm2(state, body.grade);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + updated.intervalDays);

  await prisma.reviewState.update({
    where: { cardId: body.cardId },
    data: {
      repetitions: updated.repetitions,
      intervalDays: updated.intervalDays,
      easeFactor: updated.easeFactor,
      dueAt,
      wrongCount: body.grade < 3 ? { increment: 1 } : state.wrongCount
    }
  });
  await prisma.reviewLog.create({ data: { userId: user.id, cardId: body.cardId, quality: body.grade, correct, typedAnswer: body.typedAnswer } });

  const streak = (await prisma.streak.findUnique({ where: { userId: user.id } })) ?? (await prisma.streak.create({ data: { userId: user.id } }));
  const today = new Date().toDateString();
  const last = streak.lastReviewAt?.toDateString();
  let current = streak.currentStreak;
  if (last !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    current = last === y.toDateString() ? current + 1 : 1;
    await prisma.streak.update({ where: { userId: user.id }, data: { currentStreak: current, longestStreak: Math.max(current, streak.longestStreak), lastReviewAt: new Date() } });
  }
  return NextResponse.json({ correct, expected: state.card.en, nextDue: dueAt });
}
