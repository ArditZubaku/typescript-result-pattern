import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';

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

    // TODO: use Result.to(lookup, success, fail) to turn
    // TResult<RawOrder, 'NOT_FOUND'> into TResult<OrderSummary, OrderError>.
    //
    // success: (order: RawOrder) => OrderSummary
    //   format totalCents as a dollar string, e.g. 4599 -> "$45.99"
    // fail: (error: 'NOT_FOUND') => OrderError
    //   -> { message: `order ${orderId} not found` }
    throw new Error('TODO: implement OrderSummaryService.summarize');
  }
}

export { OrderSummaryService, OrderSummary, OrderError };
