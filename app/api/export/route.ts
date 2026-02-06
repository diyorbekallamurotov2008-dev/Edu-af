import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email }, include: { cards: { include: { reviewState: true } }, settings: true } });
  return NextResponse.json({ exportedAt: new Date().toISOString(), cards: user.cards, settings: user.settings });
}
