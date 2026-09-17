# Lesson 03 — `Result.to`

## Task

`OrderSummaryService.summarize` already builds a `TResult<RawOrder, 'NOT_FOUND'>` called
`lookup`. Use `Result.to(lookup, success, fail)` to turn it into the public-facing
`TResult<OrderSummary, OrderError>` the method returns.

```
pnpm test order-summary.service
```

## What this teaches

`Result.to` maps **both channels of an existing `Result` at once** and hands back a new one —
it doesn't construct a `Result` from scratch the way `Ok`/`Err` do, and it doesn't catch a throw
the way `from`/`fromSync` do. It transforms one you already have:

```ts
static to<T, E, K, Y>(
  result: TResult<T, E>,
  success: (data: T) => K,
  fail: (error: E) => Y,
): TResult<K, Y>
```

The recurring use case: an inner layer's error shape (a terse code like `'NOT_FOUND'`) usually
isn't what you want to hand to the next caller up, or back to the client. `Result.to` is how you
translate "the internal reason this failed" into "the shape the outside world should see" without
an `if (!result.ok) { ...} else { ... }` block — the mapping happens on both branches in one call,
and the `ok`/`err` shape carries through automatically.

Reference: `../../../solutions/03-order-summary.service.ts`.
