import { Injectable } from '@nestjs/common';
import { Result } from '../../result/result';

@Injectable()
class ConfigService {
  parse(raw: string) {
    return Result.fromSync(() => JSON.parse(raw) as Record<string, unknown>);
  }

  async fetchRemoteFlag(loader: () => Promise<boolean>) {
    return Result.from(() => loader());
  }
}

export { ConfigService };
