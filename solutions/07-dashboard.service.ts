// Reference solution for lesson 07 — try it yourself first.
import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../src/result/result';
import { concurrentOrThrow } from '../src/result/concurrent';

type DashboardError = 'NEGATIVE_BALANCE';
type Dashboard = { username: string; balanceCents: number };

@Injectable()
class DashboardService {
  private async fetchUsername(userId: string): Promise<string> {
    return `user-${userId}`;
  }

  private async fetchBalanceCents(userId: string): Promise<number> {
    return userId === 'bad-actor' ? -500 : 1200;
  }

  async loadDashboard(userId: string): Promise<TResult<Dashboard, DashboardError>> {
    const [username, balanceCents] = await concurrentOrThrow([
      () => this.fetchUsername(userId),
      () => this.fetchBalanceCents(userId),
    ]);

    const isNegativeBalance = balanceCents < 0;
    if (isNegativeBalance) return Result.Err('NEGATIVE_BALANCE');

    return Result.Ok({ username, balanceCents });
  }
}

export { DashboardService, Dashboard, DashboardError };
