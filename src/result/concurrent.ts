import { Result, TResult } from './result';

const concurrent = async <T extends Array<unknown>>(fns: {
  [K in keyof T]: () => Promise<T[K]>;
}): Promise<TResult<T, unknown>> => {
  const settled = await Promise.allSettled(fns.map((fn) => fn()));
  const rejection = settled.find((it): it is PromiseRejectedResult => it.status === 'rejected');
  if (rejection) return Result.Err(rejection.reason);

  const values = settled.flatMap((it) => (it.status === 'fulfilled' ? [it.value] : []));
  return Result.Ok(values) as TResult<T>;
};

// Same shape as `concurrent`, but re-throws instead of collapsing a rejection into
// Result.Err — deliberately, for reads: if the DB is unreachable the app should crash
// with the original error and stack, not silently return Err(null).
const concurrentOrThrow = async <T extends Array<unknown>>(fns: {
  [K in keyof T]: () => Promise<T[K]>;
}): Promise<T> => {
  return Promise.all(fns.map((fn) => fn())) as Promise<T>;
};

export { concurrent, concurrentOrThrow };
