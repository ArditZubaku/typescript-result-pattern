type TResult<S = null, E = null> = TOk<S> | TErr<E>;

type TOk<S> = {
  ok: true;
  data: S;
  error: null;
  containsData: () => boolean;
};

type TErr<E> = {
  ok: false;
  data: null;
  error: E;
  containsData: () => false;
};

class Ok<S> implements TOk<S> {
  public readonly ok = true;
  public readonly error = null;
  constructor(public readonly data: S) {}

  containsData(): boolean {
    return !!this.data;
  }
}

class Err<E> implements TErr<E> {
  public readonly ok = false;
  public readonly data = null;
  constructor(public readonly error: E) {}

  containsData(): false {
    return false;
  }
}

class Result {
  static Ok<S>(data?: S): TOk<S> {
    return new Ok(data ?? (null as unknown as S));
  }

  static Err<E>(error?: E): TErr<E> {
    return new Err(error ?? (null as unknown as E));
  }

  static async from<T, E = Error>(f: () => T): Promise<TResult<Awaited<T>, E>> {
    try {
      const res = await f();
      return Result.Ok(res);
    } catch (e) {
      return Result.Err(e as E);
    }
  }

  static fromSync<T, E = Error>(f: () => T): TResult<T, E> {
    try {
      const res = f();
      return Result.Ok(res);
    } catch (e) {
      return Result.Err(e as E);
    }
  }

  static to<T, E, K, Y>(
    result: TResult<T, E>,
    success: (data: T) => K,
    fail: (error: E) => Y,
  ): TResult<K, Y> {
    if (!result.ok) return Result.Err(fail(result.error));
    return Result.Ok(success(result.data));
  }

  static toDefault(result: TResult<unknown, unknown>): TResult<null, null> {
    if (!result.ok) return Result.Err();
    return Result.Ok();
  }

  static all<T, E>(results: Array<TResult<T, E>>): TResult<Array<T>, E> {
    const failure = results.find((result) => !result.ok);
    if (failure !== undefined && !failure.ok) return Result.Err(failure.error);
    const data = results.flatMap((result) => (result.ok ? [result.data] : []));
    return Result.Ok(data);
  }
}

export { Result, TResult, TErr };
