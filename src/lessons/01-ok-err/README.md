# Lesson 01 — `Result.Ok` / `Result.Err`

## Task

Open `wallet.service.ts`. `WalletService.withdraw` has three `TODO`s. Fill each one with a
`return Result.Ok(...)` or `return Result.Err(...)` — nothing else needs to change. The guard
clauses and the named `const`s are already there; you're only filling in what each branch
returns.

Run just this lesson while you work:

```
pnpm test wallet.service
```

TypeScript will complain ("not all code paths return a value") until every branch returns.
Treat that as a feature, not noise — the compiler is doing the job a linter can't: proving you
handled every case, before you ever run a test.

## What this teaches

`Result.Ok(data)` and `Result.Err(error)` are the two constructors you reach for whenever your
**own** logic — not a throwing library call — decides success or failure. A guard clause that
would otherwise `throw` becomes a guard clause that returns `Err` instead:

```ts
// instead of:
if (isInvalidAmount) throw new Error('invalid amount');

// write:
if (isInvalidAmount) return Result.Err('INVALID_AMOUNT');
```

Notice the error type here is a string literal union (`'INVALID_AMOUNT' | 'INSUFFICIENT_FUNDS'`),
not `Error`. That's deliberate and idiomatic — when you construct the error yourself, prefer a
`SCREAMING_SNAKE_CASE` string over an `Error` instance. `Error` is for lesson 02, where you're
wrapping something that throws and don't control the failure shape.

Stuck, or want to compare your answer? `../../../solutions/01-wallet.service.ts` has a reference
implementation — try it yourself first.
