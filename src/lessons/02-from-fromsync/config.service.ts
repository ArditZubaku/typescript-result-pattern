import { Injectable } from '@nestjs/common';
import { Result, TResult } from '../../result/result';

@Injectable()
class ConfigService {
  parse(raw: string): TResult<Record<string, unknown>, Error> {
    // TODO: use Result.fromSync to wrap `JSON.parse(raw) as Record<string, unknown>` —
    // do not write a try/catch by hand.
    throw new Error('TODO: implement ConfigService.parse');
  }

  async fetchRemoteFlag(loader: () => Promise<boolean>): Promise<TResult<boolean, Error>> {
    // TODO: use Result.from to wrap `loader()` — it may reject.
    throw new Error('TODO: implement ConfigService.fetchRemoteFlag');
  }
}

export { ConfigService };
