# Tez Lug‘at

Uzbek tilidagi inglizcha so'z yodlash platformasi: yozib recall qilish, SM-2 spaced repetition, talaffuz tinglash/tekshirish, mini-o'yinlar, dashboard, JSON backup.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Prisma + PostgreSQL
- NextAuth (Email magic link + email/parol)

## Ishga tushirish
1. `npm install`
2. `.env.example` dan `.env` yarating.
3. `npx prisma migrate dev --name init`
4. `npm run prisma:seed`
5. `npm run dev`

Demo login: `demo@tezlugat.uz` / `demo12345`

## Deploy (Vercel)
- Vercel project yarating.
- `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, email/Azure env larni kiriting.
- Build command: `npm run build`.

## Funksiyalar
- So'z qo'shish (single, CSV/TSV)
- Review oqimi: UZ -> EN typed answer + grade
- Queue: due first, aks holda hardest first
- SpeechSynthesis bilan tinglash
- Web Speech API basic talaffuz tekshirish
- (Ixtiyoriy) Azure pro endpoint
- Dashboard: total/due/mastered/streak + chart
- JSON export/import

## Maxfiylik
- Mikrofon audio default saqlanmaydi.
- Faqat Pro rejimida foydalanuvchi ruxsati bo'lsa saqlash mumkin (`storeAudioForPro`).
