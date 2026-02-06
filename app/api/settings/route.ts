import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email }, include: { settings: true } });
  if (!user.settings) await prisma.userSettings.create({ data: { userId: user.id } });
  return NextResponse.json(user.settings ?? { dailyGoal: 20, pronunciationPro: false, storeAudioForPro: false });
}

export async function POST(req: Request) {
  const email = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const body = await req.json();
  const data = {
    dailyGoal: Number(body.dailyGoal ?? 20),
    pronunciationPro: Boolean(body.pronunciationPro),
    storeAudioForPro: Boolean(body.storeAudioForPro),
    azureSpeechKey: body.azureSpeechKey || null,
    azureSpeechRegion: body.azureSpeechRegion || null
  };
  const res = await prisma.userSettings.upsert({ where: { userId: user.id }, update: data, create: { ...data, userId: user.id } });
  return NextResponse.json(res);
}
