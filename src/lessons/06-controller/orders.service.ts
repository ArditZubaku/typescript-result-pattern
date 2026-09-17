import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';

type Order = { id: string; totalCents: number };
type FindOrderError = 'NOT_FOUND';

@Injectable()
class OrdersService {
  private readonly orders: Record<string, Order> = {
    'order-1': { id: 'order-1', totalCents: 4599 },
  };

  findById(orderId: string): TResult<Order, FindOrderError> {
    const order = this.orders[orderId];
    const isMissing = order === undefined;
    if (isMissing) return Result.Err('NOT_FOUND');
    return Result.Ok(order);
  }
}

export { OrdersService, Order, FindOrderError };
