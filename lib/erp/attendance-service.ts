import { AttendanceStatus, PrismaClient, SmsStatus } from '@prisma/client';
import { applyTemplate } from './template';
import { MockSmsProvider, SmsProviderInterface } from './sms-provider';

type AttendanceInput = { studentId: string; status: AttendanceStatus };

export async function saveAttendanceAndQueueSms(
  prisma: PrismaClient,
  params: {
    lessonId: string;
    markedByUserId: string;
    attendance: AttendanceInput[];
    forceSend?: boolean;
    provider?: SmsProviderInterface;
  }
) {
  const provider = params.provider ?? new MockSmsProvider();

  const [lesson, settingsRaw, template] = await Promise.all([
    prisma.lesson.findUnique({ where: { id: params.lessonId }, include: { group: { include: { course: true, teacher: { include: { user: true } } } } } }),
    prisma.setting.findMany({ where: { key: { in: ['sms_enabled', 'send_sms_on_absent', 'recipient_mode', 'center_phone'] } } }),
    prisma.smsTemplate.findUnique({ where: { key: 'ABSENT' } })
  ]);

  if (!lesson) throw new Error('Lesson not found');

  const settings = Object.fromEntries(settingsRaw.map((item) => [item.key, item.valueJson])) as Record<string, any>;
  const shouldSendSms = Boolean(settings.sms_enabled) && Boolean(settings.send_sms_on_absent);
  const recipientMode = (settings.recipient_mode as 'PARENT' | 'STUDENT' | 'BOTH') ?? 'PARENT';

  const today = new Date().toISOString().slice(0, 10);
  const lessonDay = lesson.lessonDate.toISOString().slice(0, 10);

  const saved = await prisma.$transaction(
    params.attendance.map((item) =>
      prisma.attendance.upsert({
        where: { lessonId_studentId: { lessonId: params.lessonId, studentId: item.studentId } },
        update: { status: item.status, markedByUserId: params.markedByUserId, markedAt: new Date() },
        create: { lessonId: params.lessonId, studentId: item.studentId, status: item.status, markedByUserId: params.markedByUserId }
      })
    )
  );

  const absentStudentIds = saved.filter((a) => a.status === AttendanceStatus.ABSENT).map((a) => a.studentId);
  if (!shouldSendSms || (!params.forceSend && lessonDay !== today) || absentStudentIds.length === 0 || !template?.isActive) {
    return { savedCount: saved.length, smsQueued: 0, smsSent: 0 };
  }

  const students = await prisma.student.findMany({ where: { id: { in: absentStudentIds } } });

  let sentCount = 0;
  for (const student of students) {
    const recipients =
      recipientMode === 'BOTH'
        ? [student.parentPhone, student.studentPhone].filter(Boolean) as string[]
        : recipientMode === 'STUDENT'
          ? [student.studentPhone].filter(Boolean) as string[]
          : [student.parentPhone];

    for (const toNumber of recipients) {
      const existing = await prisma.smsLog.findFirst({ where: { lessonId: lesson.id, studentId: student.id, toNumber } });
      if (existing) continue;

      const message = applyTemplate(template.text, {
        student_name: `${student.firstName} ${student.lastName}`,
        group_name: lesson.group.name,
        course_name: lesson.group.course.name,
        date: lesson.lessonDate.toISOString().slice(0, 10),
        time: lesson.startTime,
        center_phone: String(settings.center_phone ?? ''),
        teacher_name: lesson.group.teacher.user.name
      });

      const log = await prisma.smsLog.create({
        data: {
          studentId: student.id,
          lessonId: lesson.id,
          toNumber,
          message,
          provider: 'mock',
          status: SmsStatus.PENDING
        }
      });

      const result = await provider.send(toNumber, message, 'EDUAF');
      if (result.success) {
        sentCount += 1;
        await prisma.smsLog.update({
          where: { id: log.id },
          data: { status: SmsStatus.SENT, providerMessageId: result.providerMessageId, sentAt: new Date() }
        });
      } else {
        const retryData = provider.handleErrorsAndRetries(log.retryCount, result.errorText);
        await prisma.smsLog.update({
          where: { id: log.id },
          data: { status: retryData.nextStatus, errorText: result.errorText, retryCount: { increment: 1 } }
        });
      }
    }
  }

  return { savedCount: saved.length, smsQueued: absentStudentIds.length, smsSent: sentCount };
}
