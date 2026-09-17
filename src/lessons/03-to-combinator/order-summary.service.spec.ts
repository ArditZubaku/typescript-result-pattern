import { OrderSummaryService } from './order-summary.service';

describe('OrderSummaryService.summarize', () => {
  const service = new OrderSummaryService();

  it('maps a found order to a formatted summary', () => {
    const result = service.summarize('order-1');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ id: 'order-1', total: '$45.99', items: 3 });
  });

  it('maps a missing order to a friendly error, not the raw NOT_FOUND code', () => {
    const result = service.summarize('order-404');
    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ message: 'order order-404 not found' });
  });
});
