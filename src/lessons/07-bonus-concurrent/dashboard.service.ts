import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';
import { concurrentOrThrow } from '../../result/concurrent';

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
    // TODO 1: fetch the username and the balance IN PARALLEL with concurrentOrThrow —
    // they don't depend on each other, so two sequential `await`s would be a bug here,
    // not just a style nit. concurrentOrThrow returns a tuple, e.g.:
    //   const [username, balanceCents] = await concurrentOrThrow([
    //     () => this.fetchUsername(userId),
    //     () => this.fetchBalanceCents(userId),
    //   ]);

    // TODO 2: guard — a negative balanceCents -> Result.Err('NEGATIVE_BALANCE')

    // TODO 3: return Result.Ok({ username, balanceCents })
    throw new Error('TODO: implement DashboardService.loadDashboard');
  }
}

export { DashboardService, Dashboard, DashboardError };
