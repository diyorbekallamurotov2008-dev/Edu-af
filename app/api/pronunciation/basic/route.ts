import { NextResponse } from 'next/server';
import { normalizeText } from '@/lib/normalize';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!checkRateLimit(`basic-${ip}`, 60, 60_000)) return NextResponse.json({ error: 'Juda ko‘p so‘rov' }, { status: 429 });
  const { expected, transcript } = await req.json();
  const match = normalizeText(expected) === normalizeText(transcript);
  return NextResponse.json({ match, transcript });
}
