export type SmsResult = {
  success: boolean;
  providerMessageId?: string;
  errorText?: string;
};

export interface SmsProviderInterface {
  send(to: string, message: string, sender: string): Promise<SmsResult>;
  parseResponse(payload: unknown): SmsResult;
  handleErrorsAndRetries(retryCount: number, error?: string): { nextRetry: boolean; nextStatus: 'FAILED' | 'RETRYING' };
}

export class MockSmsProvider implements SmsProviderInterface {
  async send(to: string, message: string, sender: string): Promise<SmsResult> {
    return this.parseResponse({ ok: true, id: `mock-${Date.now()}`, to, message, sender });
  }

  parseResponse(payload: any): SmsResult {
    if (payload?.ok) return { success: true, providerMessageId: payload.id };
    return { success: false, errorText: payload?.error ?? 'Unknown mock error' };
  }

  handleErrorsAndRetries(retryCount: number): { nextRetry: boolean; nextStatus: 'FAILED' | 'RETRYING' } {
    return retryCount < 3 ? { nextRetry: true, nextStatus: 'RETRYING' } : { nextRetry: false, nextStatus: 'FAILED' };
  }
}

export class HttpSmsProvider implements SmsProviderInterface {
  constructor(private readonly apiUrl: string, private readonly apiKey: string) {}

  async send(to: string, message: string, sender: string): Promise<SmsResult> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ to, message, sender })
    });

    const payload = await response.json();
    return this.parseResponse(payload);
  }

  parseResponse(payload: any): SmsResult {
    if (payload?.status === 'accepted' || payload?.success === true) {
      return { success: true, providerMessageId: payload.message_id ?? payload.id };
    }
    return { success: false, errorText: payload?.error ?? 'Provider rejected message' };
  }

  handleErrorsAndRetries(retryCount: number): { nextRetry: boolean; nextStatus: 'FAILED' | 'RETRYING' } {
    return retryCount < 3 ? { nextRetry: true, nextStatus: 'RETRYING' } : { nextRetry: false, nextStatus: 'FAILED' };
  }
}
