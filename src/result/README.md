# Lesson 00 — the `Result` type itself

Read-only. No TODOs here — `result.ts` is the finished library the rest of the
workshop is built on. Run its tests and read them alongside the source:

```
pnpm test result.spec
```

## The problem it solves

A thrown exception is invisible in a function's type signature. `parse(raw: string): Config`
tells you nothing about whether it can fail — you find out at runtime, or by reading the body.
`Result` makes failure a **value**: `parse(raw: string): TResult<Config, Error>` tells the
caller, at the type level, that this can fail and forces them to check before touching `.data`.

## The shape

```ts
type TResult<S, E> = TOk<S> | TErr<E>;
// TOk<S>  = { ok: true,  data: S,    error: null }
// TErr<E> = { ok: false, data: null, error: E    }
```

A discriminated union on `ok`. Check `result.ok` and TypeScript narrows the rest —
see the "narrows by `ok`" test in `result.spec.ts`.

## The API

- **`Result.Ok(data)` / `Result.Err(error)`** — construct directly. Use these when your own
  logic decides success or failure (a guard clause, a lookup). Lesson 01.
- **`Result.fromSync(fn)` / `Result.from(fn)`** — wrap a function that might *throw* (sync or
  async) into a `Result` instead. This is the **only** sanctioned way to touch a throwable API
  without a `try/catch`.
  Lesson 02.
- **`Result.to(result, success, fail)`** — map both channels of an existing `Result` at once,
  producing a new `Result`. Use it to turn an internal error shape into a public one, or raw
  data into a formatted view. Lesson 03.
- **`Result.all(results)`** — collapse `Array<TResult<T, E>>` into one `TResult<Array<T>, E>`,
  short-circuiting on the first failure. Lesson 04.
- **`Result.toDefault(result)`** — collapse any `Result` down to `TResult<null, null>` when you
  only care that a write succeeded, not what it returned.

## The footgun: `containsData()`

`containsData()` is `!!this.data`, **not** `this.ok`. `Result.Ok(0)`, `Result.Ok('')`, and
`Result.Ok(false)` are all successful results that report `containsData() === false`. See the
dedicated test block. Prefer checking `.ok` directly; reach for `containsData()` only when a
falsy success value is genuinely meaningless in context (e.g. "did the lookup find a row").

## Where this goes next

Lessons 01–04 are the API in isolation. Lesson 05 is the real payoff: composing several
`Result`-returning steps into one straight-line "railway" — the shape every service
method is expected to have. Lesson 06 wires a `Result`-returning service into a NestJS
controller the way this codebase actually does it. Lesson 07 is a bonus on reading two things in
parallel without giving up the railway shape.
