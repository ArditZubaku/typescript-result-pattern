// Reference solution for lesson 03 — try it yourself first.
import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../src/result/result';

type RawOrder = { id: string; totalCents: number; itemCount: number };
type OrderSummary = { id: string; total: string; items: number };
type OrderError = { message: string };

@Injectable()
class OrderSummaryService {
  private readonly orders: Record<string, RawOrder> = {
    'order-1': { id: 'order-1', totalCents: 4599, itemCount: 3 },
  };

  summarize(orderId: string): TResult<OrderSummary, OrderError> {
    const found = this.orders[orderId];
    const lookup: TResult<RawOrder, 'NOT_FOUND'> =
      found === undefined ? Result.Err('NOT_FOUND') : Result.Ok(found);

    return Result.to(
      lookup,
      (order) => ({
        id: order.id,
        total: `$${(order.totalCents / 100).toFixed(2)}`,
        items: order.itemCount,
      }),
      () => ({ message: `order ${orderId} not found` }),
    );
  }
}

export { OrderSummaryService, OrderSummary, OrderError };
