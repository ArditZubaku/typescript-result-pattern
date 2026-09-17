# Lesson 05 — the railway

This is the lesson that matters most. Lessons 01–04 taught the API. This one teaches the shape
real service methods are expected to have.

## Task

`CheckoutService.checkout` already has all three guard clauses written — read them first. Fill
in the two `TODO`s: compute `totalCents` (a pure calculation, no `Result` involved), then build
and record the `Receipt` and return `Result.Ok(receipt)`.

```
pnpm test checkout.service
```

## The railway

A "railway" is a flat sequence — `guard → guard → guard → transform → write → return` — where
every fallible step either succeeds and falls through to the next line, or returns `Err`
immediately. No nesting, no `else`, no branch you have to hold in your head while reading the
next one. Look at the shape of the finished method top to bottom:

```
guard: unknown sku       -> Err('UNKNOWN_SKU')
guard: out of stock      -> Err('OUT_OF_STOCK')
guard: unknown coupon    -> Err('UNKNOWN_COUPON')
transform: compute total  (cannot fail)
write: record the receipt -> Ok(receipt)
```

Each guard is a named `const` (`isUnknownSku`, `isOutOfStock`, `isUnknownCoupon`) followed by an
`if` that returns `Err` and nothing else. That's the pattern: **name the condition, then act on
it** — never an inline predicate buried in the `if`. By the last line, every failure case has
already exited; what's left is guaranteed valid, and the type system knows it. Notice `coupon`'s
type: before the `isUnknownCoupon` guard it's `Coupon | null | undefined`; after it, TypeScript
has narrowed away `undefined`, because that guard is the only place `undefined` was possible.
You get that for free from an early return — no cast, no non-null assertion.

## Not everything is a `Result`

The total-price calculation cannot fail — it's arithmetic. It does **not** return a `TResult`.
Wrapping something infallible in `Result.Ok` "just in case" is noise: it adds a branch a reader
has to rule out, for a branch that can never happen. Reach for `Result` exactly where failure is
real, and nowhere else. The skill this lesson is really building is judgment: which steps are
guards (fallible, return `Err`), which are pure transforms (infallible, just a value), and which
are writes (the one place side effects belong, at the bottom, wrapped in `Ok`).

## Why this shape, specifically

Compare it to the nested alternative:

```ts
if (product) {
  if (product.stock >= args.quantity) {
    if (!args.couponCode || coupon) {
      // the actual logic, three levels deep
    } else {
      return Result.Err('UNKNOWN_COUPON');
    }
  } else {
    return Result.Err('OUT_OF_STOCK');
  }
} else {
  return Result.Err('UNKNOWN_SKU');
}
```

Same behavior, but you can't read it top to bottom — the success path is buried inside three
conditions you have to keep open in your head, and each error case is far from the guard that
produces it. The railway inverts that: failure exits immediately and locally; the success path is
just "whatever's left after the guards," always at the bottom, never nested. 

Reference: `../../../solutions/05-checkout.service.ts`.
