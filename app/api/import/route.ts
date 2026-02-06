import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-user';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const body = await req.json();
  if (!Array.isArray(body.cards)) return NextResponse.json({ error: 'JSON noto‘g‘ri' }, { status: 400 });
  for (const c of body.cards) {
    await prisma.card.create({
      data: {
        userId: user.id,
        en: c.en,
        uz: c.uz,
        example: c.example,
        imageUrl: c.imageUrl ?? null,
        reviewState: { create: { userId: user.id, repetitions: c.reviewState?.repetitions ?? 0, intervalDays: c.reviewState?.intervalDays ?? 1, easeFactor: c.reviewState?.easeFactor ?? 2.5, dueAt: c.reviewState?.dueAt ? new Date(c.reviewState.dueAt) : new Date(), wrongCount: c.reviewState?.wrongCount ?? 0 } }
      }
    });
  }
  return NextResponse.json({ imported: body.cards.length });
}
