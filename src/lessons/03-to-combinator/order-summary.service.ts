import { Injectable } from "@nestjs/common";
import { Result, TResult } from "../../result/result";

type RawOrder = { id: string; totalCents: number; itemCount: number };
type OrderSummary = { id: string; total: string; items: number };
type OrderError = { message: string };

@Injectable()
class OrderSummaryService {
  private readonly orders: Record<string, RawOrder> = {
    "order-1": { id: "order-1", totalCents: 4599, itemCount: 3 },
  };

  summarize(orderId: string): TResult<OrderSummary, OrderError> {
    const found = this.orders[orderId];
    const lookup: TResult<RawOrder, "NOT_FOUND"> =
      found === undefined ? Result.Err("NOT_FOUND") : Result.Ok(found);

    const success = (order: RawOrder): OrderSummary => {
      function formatCentsToDollars(totalCents: number): string {
        return (totalCents / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      }

      return {
        id: order.id,
        total: formatCentsToDollars(order.totalCents),
        items: order.itemCount,
      };
    };

    const fail = (_error: "NOT_FOUND"): OrderError => {
      return { message: `order ${orderId} not found` };
    };

    return Result.to(lookup, success, fail);
  }
}

export { OrderSummaryService, OrderSummary, OrderError };
