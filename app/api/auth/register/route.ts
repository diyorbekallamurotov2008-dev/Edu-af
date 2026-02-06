import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.email || !body.password) return NextResponse.json({ error: 'Noto‘g‘ri ma’lumot' }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return NextResponse.json({ error: 'Bu email mavjud' }, { status: 409 });
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { email: body.email, name: body.name, passwordHash, settings: { create: {} }, streak: { create: {} } }
  });
  return NextResponse.json({ id: user.id });
}
