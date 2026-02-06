import { describe, it, expect } from 'vitest';
import { normalizeText } from '@/lib/normalize';

describe('normalizeText', () => {
  it('normalizes punctuation and case', () => {
    expect(normalizeText(' Hello, WORLD!! ')).toBe('hello world');
  });
});
