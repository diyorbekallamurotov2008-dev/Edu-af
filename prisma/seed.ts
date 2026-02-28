import { PrismaClient, PriceType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const superAdmin = await prisma.user.upsert({
    where: { phone: '+998900000001' },
    update: {},
    create: {
      name: 'Center Owner',
      phone: '+998900000001',
      email: 'owner@eduaf.uz',
      passwordHash: await bcrypt.hash('Admin12345!', 10),
      role: UserRole.SUPER_ADMIN
    }
  });

  const teacherUser = await prisma.user.upsert({
    where: { phone: '+998900000010' },
    update: {},
    create: {
      name: 'Aziza Teacher',
      phone: '+998900000010',
      email: 'teacher@eduaf.uz',
      passwordHash: await bcrypt.hash('Teacher12345!', 10),
      role: UserRole.TEACHER
    }
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: { userId: teacherUser.id, bio: 'IELTS instructor' }
  });

  const course = await prisma.course.upsert({
    where: { id: 'seed-ielts-course' },
    update: {},
    create: {
      id: 'seed-ielts-course',
      name: 'IELTS Foundation',
      description: 'Grammar + Listening + Reading',
      duration: 6,
      priceType: PriceType.MONTHLY,
      priceAmount: 450000
    }
  });

  const group = await prisma.group.create({
    data: {
      name: 'IELTS-01',
      courseId: course.id,
      teacherId: teacher.id,
      startDate: new Date(),
      maxStudents: 15,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '18:30', endTime: '20:00', room: 'A-1' },
          { dayOfWeek: 3, startTime: '18:30', endTime: '20:00', room: 'A-1' },
          { dayOfWeek: 5, startTime: '18:30', endTime: '20:00', room: 'A-1' }
        ]
      }
    }
  });

  const student = await prisma.student.create({
    data: {
      firstName: 'Ali',
      lastName: 'Karimov',
      studentPhone: '+998901112233',
      parentPhone: '+998909998877'
    }
  });

  await prisma.groupStudent.create({
    data: { groupId: group.id, studentId: student.id }
  });

  await prisma.smsTemplate.createMany({
    data: [
      {
        key: 'ABSENT',
        text: 'Hurmatli ota-ona, {{student_name}} {{date}} {{time}} dagi darsga kelmadi. Savol uchun: {{center_phone}}'
      },
      {
        key: 'LATE',
        text: '{{student_name}} bugungi darsga kechikdi. O‘qituvchi: {{teacher_name}}'
      }
    ],
    skipDuplicates: true
  });

  await prisma.setting.createMany({
    data: [
      { key: 'sms_enabled', valueJson: true },
      { key: 'send_sms_on_absent', valueJson: true },
      { key: 'recipient_mode', valueJson: 'PARENT' },
      { key: 'center_phone', valueJson: '+998712000000' },
      { key: 'timezone', valueJson: 'Asia/Tashkent' },
      { key: 'sms_provider', valueJson: { provider_name: 'mock', sender_id: 'EDUAF', test_mode: true } }
    ],
    skipDuplicates: true
  });

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'seed.created',
      entity: 'system',
      entityId: 'seed',
      metaJson: { demo: true }
    }
  });
}

main().finally(() => prisma.$disconnect());
