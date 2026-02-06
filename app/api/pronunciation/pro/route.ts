import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!checkRateLimit(`pro-${ip}`, 20, 60_000)) return NextResponse.json({ error: 'Juda ko‘p so‘rov' }, { status: 429 });
  const { expectedText } = await req.json();
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return NextResponse.json({ error: 'Azure sozlanmagan' }, { status: 400 });
  return NextResponse.json({
    message: 'Pro baholash uchun frontend audio blob yuborishi kerak. Audio saqlanmaydi, faqat explicit ruxsatda.',
    expectedText,
    accuracy: 0,
    fluency: 0,
    words: []
  });
}
