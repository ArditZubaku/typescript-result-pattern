// Reference solution for lesson 04 — try it yourself first.
import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../src/result/result';

type CartLine = { sku: string; quantity: number };
type ValidatedLine = { sku: string; quantity: number; lineTotalCents: number };
type LineError = { sku: string; reason: 'UNKNOWN_SKU' | 'OUT_OF_STOCK' };

@Injectable()
class CartService {
  private readonly catalog: Record<string, { priceCents: number; stock: number }> = {
    'sku-1': { priceCents: 500, stock: 10 },
    'sku-2': { priceCents: 1200, stock: 0 },
  };

  private validateLine(line: CartLine): TResult<ValidatedLine, LineError> {
    const item = this.catalog[line.sku];
    const isUnknownSku = item === undefined;
    if (isUnknownSku) return Result.Err({ sku: line.sku, reason: 'UNKNOWN_SKU' });

    const isOutOfStock = item.stock < line.quantity;
    if (isOutOfStock) return Result.Err({ sku: line.sku, reason: 'OUT_OF_STOCK' });

    const lineTotalCents = item.priceCents * line.quantity;
    return Result.Ok({ sku: line.sku, quantity: line.quantity, lineTotalCents });
  }

  validateCart(lines: Array<CartLine>): TResult<Array<ValidatedLine>, LineError> {
    const validated = lines.map((line) => this.validateLine(line));
    return Result.all(validated);
  }
}

export { CartService, CartLine, ValidatedLine, LineError };
