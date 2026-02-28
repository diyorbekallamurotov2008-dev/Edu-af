import { describe, expect, it } from 'vitest';
import { HttpSmsProvider, MockSmsProvider } from '../lib/erp/sms-provider';

describe('sms providers', () => {
  it('mock provider returns success', async () => {
    const provider = new MockSmsProvider();
    const result = await provider.send('+998901234567', 'hello', 'EDUAF');
    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBeTruthy();
  });

  it('retry policy stops after 3', () => {
    const provider = new MockSmsProvider();
    expect(provider.handleErrorsAndRetries(0).nextStatus).toBe('RETRYING');
    expect(provider.handleErrorsAndRetries(3).nextStatus).toBe('FAILED');
  });

  it('http provider parseResponse understands failure payload', () => {
    const provider = new HttpSmsProvider('http://localhost:8080', 'token');
    const result = provider.parseResponse({ success: false, error: 'bad request' });
    expect(result.success).toBe(false);
    expect(result.errorText).toContain('bad request');
  });
});
