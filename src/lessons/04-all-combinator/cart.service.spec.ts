import { CartService } from './cart.service';

describe('CartService.validateCart', () => {
  const service = new CartService();

  it('is Ok with every validated line, in order, when the whole cart is valid', () => {
    const result = service.validateCart([
      { sku: 'sku-1', quantity: 2 },
      { sku: 'sku-1', quantity: 1 },
    ]);
    expect(result.ok).toBe(true);
    expect(result.data).toEqual([
      { sku: 'sku-1', quantity: 2, lineTotalCents: 1000 },
      { sku: 'sku-1', quantity: 1, lineTotalCents: 500 },
    ]);
  });

  it('is Err on the first failing line when the sku is unknown', () => {
    const result = service.validateCart([
      { sku: 'sku-1', quantity: 1 },
      { sku: 'sku-does-not-exist', quantity: 1 },
    ]);
    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ sku: 'sku-does-not-exist', reason: 'UNKNOWN_SKU' });
  });

  it('is Err on the first failing line when a sku is out of stock', () => {
    const result = service.validateCart([{ sku: 'sku-2', quantity: 1 }]);
    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ sku: 'sku-2', reason: 'OUT_OF_STOCK' });
  });
});
