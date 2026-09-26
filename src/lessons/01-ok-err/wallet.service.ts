import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';

type WithdrawError = 'INVALID_AMOUNT' | 'INSUFFICIENT_FUNDS';
type WithdrawResult = TResult<{ newBalanceCents: number }, WithdrawError>;

@Injectable()
class WalletService {
  withdraw(args: { balanceCents: number; amountCents: number }): WithdrawResult {
    const isInvalidAmount = args.amountCents <= 0;
    if (isInvalidAmount) {
      return Result.Err('INVALID_AMOUNT');
    }

    const hasInsufficientFunds = args.amountCents > args.balanceCents;
    if (hasInsufficientFunds) {
      return Result.Err('INSUFFICIENT_FUNDS');
    }

    const newBalanceCents = args.balanceCents - args.amountCents;
    return Result.Ok({newBalanceCents});
  }
}

export { WalletService, WithdrawError };
