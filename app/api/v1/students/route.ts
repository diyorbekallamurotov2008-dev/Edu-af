import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') ?? '';
  const students = await prisma.student.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { parentPhone: { contains: search } },
            { studentPhone: { contains: search } }
          ]
        }
      : undefined,
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ data: students });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.student.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      studentPhone: body.studentPhone,
      parentPhone: body.parentPhone,
      address: body.address,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      notes: body.notes
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
