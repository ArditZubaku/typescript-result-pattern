import { WalletService } from './wallet.service';

describe('WalletService.withdraw', () => {
  const service = new WalletService();

  it('rejects a zero amount', () => {
    const result = service.withdraw({ balanceCents: 500, amountCents: 0 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_AMOUNT');
  });

  it('rejects a negative amount', () => {
    const result = service.withdraw({ balanceCents: 500, amountCents: -50 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_AMOUNT');
  });

  it('rejects an amount larger than the balance', () => {
    const result = service.withdraw({ balanceCents: 500, amountCents: 501 });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INSUFFICIENT_FUNDS');
  });

  it('returns the new balance on success', () => {
    const result = service.withdraw({ balanceCents: 500, amountCents: 200 });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ newBalanceCents: 300 });
  });

  it('allows withdrawing the full balance down to zero', () => {
    const result = service.withdraw({ balanceCents: 500, amountCents: 500 });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ newBalanceCents: 0 });
  });
});
