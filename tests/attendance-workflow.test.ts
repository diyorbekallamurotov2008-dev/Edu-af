import { describe, expect, it, vi } from 'vitest';
import { saveAttendanceAndQueueSms } from '../lib/erp/attendance-service';
import { AttendanceStatus } from '@prisma/client';

describe('attendance workflow', () => {
  it('creates sms only once per lesson/student/recipient', async () => {
    const existing = new Set<string>();
    const createSms = vi.fn(async ({ data }: any) => ({ id: `log-${data.studentId}`, retryCount: 0, ...data }));
    const updateSms = vi.fn(async ({ data }: any) => data);

    const prisma: any = {
      lesson: {
        findUnique: vi.fn(async () => ({
          id: 'lesson-1',
          lessonDate: new Date(),
          startTime: '18:30',
          group: {
            name: 'G-1',
            course: { name: 'IELTS' },
            teacher: { user: { name: 'Aziza' } }
          }
        }))
      },
      setting: {
        findMany: vi.fn(async () => [
          { key: 'sms_enabled', valueJson: true },
          { key: 'send_sms_on_absent', valueJson: true },
          { key: 'recipient_mode', valueJson: 'PARENT' },
          { key: 'center_phone', valueJson: '+998712000000' }
        ])
      },
      smsTemplate: { findUnique: vi.fn(async () => ({ key: 'ABSENT', text: 'x', isActive: true })) },
      $transaction: vi.fn(async (queries: any[]) => Promise.all(queries)),
      attendance: {
        upsert: vi.fn(async ({ create }: any) => ({ ...create }))
      },
      student: {
        findMany: vi.fn(async () => [{ id: 's1', firstName: 'Ali', lastName: 'K', parentPhone: '+99890' }])
      },
      smsLog: {
        findFirst: vi.fn(async ({ where }: any) => {
          const key = `${where.lessonId}-${where.studentId}-${where.toNumber}`;
          return existing.has(key) ? { id: 'exists' } : null;
        }),
        create: vi.fn(async ({ data }: any) => {
          existing.add(`${data.lessonId}-${data.studentId}-${data.toNumber}`);
          return createSms({ data });
        }),
        update: updateSms
      }
    };

    const payload = {
      lessonId: 'lesson-1',
      markedByUserId: 'u1',
      attendance: [{ studentId: 's1', status: AttendanceStatus.ABSENT as const }]
    };

    const first = await saveAttendanceAndQueueSms(prisma, payload);
    const second = await saveAttendanceAndQueueSms(prisma, payload);

    expect(first.smsSent).toBe(1);
    expect(second.smsSent).toBe(0);
  });
});
