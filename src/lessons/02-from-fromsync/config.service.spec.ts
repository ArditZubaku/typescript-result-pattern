import { ConfigService } from './config.service';

describe('ConfigService.parse', () => {
  const service = new ConfigService();

  it('parses valid JSON into an Ok', () => {
    const result = service.parse('{"port": 3000}');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ port: 3000 });
  });

  it('turns a JSON.parse throw into an Err instead of throwing', () => {
    const result = service.parse('{not json');
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});

describe('ConfigService.fetchRemoteFlag', () => {
  const service = new ConfigService();

  it('resolves to Ok when the loader resolves', async () => {
    const result = await service.fetchRemoteFlag(async () => true);
    expect(result.ok).toBe(true);
    expect(result.data).toBe(true);
  });

  it('resolves to Err when the loader rejects, instead of the promise rejecting', async () => {
    const result = await service.fetchRemoteFlag(async () => {
      throw new Error('network down');
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('network down');
  });
});
