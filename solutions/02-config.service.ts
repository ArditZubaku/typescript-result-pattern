// Reference solution for lesson 02 — try it yourself first.
import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../src/result/result';

@Injectable()
class ConfigService {
  parse(raw: string): TResult<Record<string, unknown>, Error> {
    return Result.fromSync(() => JSON.parse(raw) as Record<string, unknown>);
  }

  async fetchRemoteFlag(loader: () => Promise<boolean>): Promise<TResult<boolean, Error>> {
    return Result.from(() => loader());
  }
}

export { ConfigService };
