import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';

type WithdrawError = 'INVALID_AMOUNT' | 'INSUFFICIENT_FUNDS';
type WithdrawResult = TResult<{ newBalanceCents: number }, WithdrawError>;

@Injectable()
class WalletService {
  withdraw(args: { balanceCents: number; amountCents: number }): WithdrawResult {
    const isInvalidAmount = args.amountCents <= 0;
    if (isInvalidAmount) {
      // TODO 1: return a Result.Err carrying 'INVALID_AMOUNT'
    }

    const hasInsufficientFunds = args.amountCents > args.balanceCents;
    if (hasInsufficientFunds) {
      // TODO 2: return a Result.Err carrying 'INSUFFICIENT_FUNDS'
    }

    const newBalanceCents = args.balanceCents - args.amountCents;
    // TODO 3: return a Result.Ok wrapping { newBalanceCents }
  }
}

export { WalletService, WithdrawError };
