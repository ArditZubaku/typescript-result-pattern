// Reference solution for lesson 05 — try it yourself first.
import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../src/result/result';

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

    const fullPriceCents = product.priceCents * args.quantity;
    const discountCents = coupon === null ? 0 : (fullPriceCents * coupon.percentOff) / 100;
    const totalCents = fullPriceCents - discountCents;

    const receipt: Receipt = {
      sku: args.sku,
      quantity: args.quantity,
      totalCents,
      couponApplied: coupon === null ? null : coupon.code,
    };
    this.receipts.push(receipt);
    return Result.Ok(receipt);
  }
}

export { CheckoutService, Receipt, CheckoutError };
