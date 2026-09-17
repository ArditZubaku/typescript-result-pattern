import { CheckoutService } from './checkout.service';

describe('CheckoutService.checkout', () => {
  it('rejects an unknown sku', () => {
    const service = new CheckoutService();
    const result = service.checkout({ sku: 'ghost-sku', quantity: 1, couponCode: null });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('UNKNOWN_SKU');
  });

  it('rejects a quantity larger than stock', () => {
    const service = new CheckoutService();
    const result = service.checkout({ sku: 'sku-1', quantity: 99, couponCode: null });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('OUT_OF_STOCK');
  });

  it('rejects an unknown coupon code', () => {
    const service = new CheckoutService();
    const result = service.checkout({ sku: 'sku-1', quantity: 1, couponCode: 'GHOST10' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('UNKNOWN_COUPON');
  });

  it('charges full price with no coupon', () => {
    const service = new CheckoutService();
    const result = service.checkout({ sku: 'sku-1', quantity: 1, couponCode: null });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({
      sku: 'sku-1',
      quantity: 1,
      totalCents: 500,
      couponApplied: null,
    });
  });

  it('applies the coupon percentage off the total', () => {
    const service = new CheckoutService();
    const result = service.checkout({ sku: 'sku-1', quantity: 2, couponCode: 'SAVE10' });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({
      sku: 'sku-1',
      quantity: 2,
      totalCents: 900,
      couponApplied: 'SAVE10',
    });
  });

  it('records the receipt as a side effect of a successful checkout', () => {
    const service = new CheckoutService();
    service.checkout({ sku: 'sku-1', quantity: 1, couponCode: null });
    expect(service.getReceipts()).toHaveLength(1);
  });

  it('does not record a receipt when checkout fails', () => {
    const service = new CheckoutService();
    service.checkout({ sku: 'ghost-sku', quantity: 1, couponCode: null });
    expect(service.getReceipts()).toHaveLength(0);
  });
});
