import { describe, it, expect } from 'vitest';
import { nextSm2 } from '@/lib/sm2';

describe('SM2', () => {
  it('resets on low grade', () => {
    const r = nextSm2({ repetitions: 3, intervalDays: 10, easeFactor: 2.5 }, 0);
    expect(r.repetitions).toBe(0);
    expect(r.intervalDays).toBe(1);
  });

  it('increments with good grades', () => {
    const r1 = nextSm2({ repetitions: 0, intervalDays: 1, easeFactor: 2.5 }, 4);
    const r2 = nextSm2(r1, 4);
    expect(r1.intervalDays).toBe(1);
    expect(r2.intervalDays).toBe(6);
  });
});
