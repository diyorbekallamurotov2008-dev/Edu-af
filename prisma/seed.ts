import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@tezlugat.uz';
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Demo',
      passwordHash: await bcrypt.hash('demo12345', 10),
      settings: { create: { dailyGoal: 20 } },
      streak: { create: {} }
    }
  });

  const words = [
    ['apple', 'olma', 'I eat an apple every day.'],
    ['book', 'kitob', 'This book is very interesting.'],
    ['water', 'suv', 'Please drink enough water.'],
    ['school', 'maktab', 'My school starts at 8 AM.']
  ];

  for (const [en, uz, example] of words) {
    const card = await prisma.card.create({ data: { userId: user.id, en, uz, example } });
    await prisma.reviewState.create({ data: { userId: user.id, cardId: card.id } });
  }
}

main().finally(() => prisma.$disconnect());
