import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId') ?? undefined;
  const items = await prisma.payment.findMany({
    where: studentId ? { studentId } : undefined,
    orderBy: { paidAt: 'desc' }
  });
  return NextResponse.json({ data: items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.payment.create({
    data: {
      studentId: body.studentId,
      groupId: body.groupId,
      amount: body.amount,
      paidAt: new Date(body.paidAt ?? Date.now()),
      method: body.method,
      note: body.note
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
