import { Result } from './result';

describe('Result.Ok / Result.Err', () => {
  it('Ok carries data, a null error, and ok: true', () => {
    const result = Result.Ok({ id: 1 });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ id: 1 });
    expect(result.error).toBeNull();
  });

  it('Err carries an error, null data, and ok: false', () => {
    const result = Result.Err('NOT_FOUND');
    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBe('NOT_FOUND');
  });

  it('narrows by `ok` — TypeScript, not just the runtime value', () => {
    const result = Math.random() > 2 ? Result.Ok(42) : Result.Err('NEVER_HAPPENS');
    if (!result.ok) {
      const errorIsString: string = result.error;
      expect(typeof errorIsString).toBe('string');
      return;
    }
    const dataIsNumber: number = result.data;
    expect(typeof dataIsNumber).toBe('number');
  });
});

describe('containsData — a footgun to know about', () => {
  it('is true for truthy data', () => {
    expect(Result.Ok({ id: 1 }).containsData()).toBe(true);
  });

  it('is false for falsy data even though the Result is Ok — it is `!!data`, not `ok`', () => {
    expect(Result.Ok(0).containsData()).toBe(false);
    expect(Result.Ok('').containsData()).toBe(false);
    expect(Result.Ok(false).containsData()).toBe(false);
  });

  it('is always false on Err', () => {
    expect(Result.Err('X').containsData()).toBe(false);
  });
});

describe('Result.fromSync', () => {
  it('wraps a throwing sync function into an Err instead of letting it throw', () => {
    const result = Result.fromSync(() => JSON.parse('{not json'));
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it('wraps a successful sync function into an Ok', () => {
    const result = Result.fromSync(() => JSON.parse('{"a":1}'));
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ a: 1 });
  });
});

describe('Result.from', () => {
  it('wraps a rejected async function into an Err', async () => {
    const result = await Result.from(async () => {
      throw new Error('network down');
    });
    expect(result.ok).toBe(false);
    expect((result.error as Error).message).toBe('network down');
  });

  it('wraps a resolved async function into an Ok', async () => {
    const result = await Result.from(async () => 'value');
    expect(result.ok).toBe(true);
    expect(result.data).toBe('value');
  });
});

describe('Result.to — mapping both channels at once', () => {
  const parseAge = (raw: string) =>
    Result.to(
      Result.fromSync<number, Error>(() => {
        const age = Number(raw);
        const isValidAge = !Number.isNaN(age) && age >= 0;
        if (!isValidAge) throw new Error(`not an age: ${raw}`);
        return age;
      }),
      (age) => `${age} years old`,
      (error) => ({ message: error.message }),
    );

  it('maps the success channel with `success`', () => {
    const result = parseAge('30');
    expect(result.ok).toBe(true);
    expect(result.data).toBe('30 years old');
  });

  it('maps the failure channel with `fail`', () => {
    const result = parseAge('nope');
    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ message: 'not an age: nope' });
  });
});

describe('Result.all — collapse many Results into one', () => {
  it('is Ok with all the data, in order, when every Result is Ok', () => {
    const result = Result.all([Result.Ok(1), Result.Ok(2), Result.Ok(3)]);
    expect(result.ok).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });

  it('is Err with the first failing error when any Result is an Err', () => {
    const result = Result.all([Result.Ok(1), Result.Err('BAD_2'), Result.Err('BAD_3')]);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('BAD_2');
  });
});
