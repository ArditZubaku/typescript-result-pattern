import { DashboardService } from './dashboard.service';

describe('DashboardService.loadDashboard', () => {
  const service = new DashboardService();

  it('loads the username and balance together', async () => {
    const result = await service.loadDashboard('42');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ username: 'user-42', balanceCents: 1200 });
  });

  it('rejects a negative balance', async () => {
    const result = await service.loadDashboard('bad-actor');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('NEGATIVE_BALANCE');
  });
});
