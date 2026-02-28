import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveAttendanceAndQueueSms } from '@/lib/erp/attendance-service';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await saveAttendanceAndQueueSms(prisma, {
    lessonId: body.lessonId,
    markedByUserId: body.markedByUserId,
    attendance: body.attendance,
    forceSend: body.forceSend
  });

  return NextResponse.json({ data: result });
}
