import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';

type Product = { sku: string; priceCents: number; stock: number };
type Coupon = { code: string; percentOff: number };
type CheckoutError = 'UNKNOWN_SKU' | 'OUT_OF_STOCK' | 'UNKNOWN_COUPON';
type Receipt = { sku: string; quantity: number; totalCents: number; couponApplied: string | null };

@Injectable()
class CheckoutService {
  private readonly products: Record<string, Product> = {
    'sku-1': { sku: 'sku-1', priceCents: 500, stock: 10 },
  };
  private readonly coupons: Record<string, Coupon> = {
    SAVE10: { code: 'SAVE10', percentOff: 10 },
  };
  private readonly receipts: Array<Receipt> = [];

  getReceipts(): Array<Receipt> {
    return this.receipts;
  }

  checkout(args: {
    sku: string;
    quantity: number;
    couponCode: string | null;
  }): TResult<Receipt, CheckoutError> {
    const product = this.products[args.sku];
    const isUnknownSku = product === undefined;
    if (isUnknownSku) return Result.Err('UNKNOWN_SKU');

    const isOutOfStock = product.stock < args.quantity;
    if (isOutOfStock) return Result.Err('OUT_OF_STOCK');

    const coupon = args.couponCode === null ? null : this.coupons[args.couponCode];
    const isUnknownCoupon = coupon === undefined;
    if (isUnknownCoupon) return Result.Err('UNKNOWN_COUPON');

    // ---- every guard above either returned Err or narrowed a value. From here
    // ---- on nothing can fail — this is a pure transform, not a Result step.
    //
    // TODO 1: compute `totalCents`:
    //   - start from product.priceCents * args.quantity
    //   - if `coupon` is present, subtract coupon.percentOff percent off that

    // TODO 2: this is the "write" — build the Receipt (sku, quantity, totalCents,
    // couponApplied: coupon ? coupon.code : null), push it onto `this.receipts`,
    // and return Result.Ok(receipt).
    throw new Error('TODO: implement CheckoutService.checkout');
  }
}

export { CheckoutService, Receipt, CheckoutError };
