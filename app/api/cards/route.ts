import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-user';
import { prisma } from '@/lib/prisma';
import { cardSchema } from '@/lib/validators';

export async function GET() {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const cards = await prisma.card.findMany({ where: { userId: user.id }, include: { reviewState: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const parsed = items.map((i) => cardSchema.parse(i));
  for (const item of parsed) {
    await prisma.card.create({
      data: {
        userId: user.id,
        en: item.en,
        uz: item.uz,
        example: item.example,
        imageUrl: item.imageUrl || null,
        reviewState: { create: { userId: user.id } }
      }
    });
  }
  return NextResponse.json({ count: parsed.length });
}
