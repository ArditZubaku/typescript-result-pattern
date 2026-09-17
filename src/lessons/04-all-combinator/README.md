# Lesson 04 — `Result.all`

## Task

`CartService.validateCart` already maps each line through `validateLine`, producing
`Array<TResult<ValidatedLine, LineError>>`. Use `Result.all` to collapse that into a single
`TResult<Array<ValidatedLine>, LineError>`.

```
pnpm test cart.service
```

## What this teaches

You often end up with an array of `Result`s — one per item you validated or processed — and what
you actually want is one `Result` covering the whole batch: either everything succeeded and you
have all the data, or something failed and you want *that* error, not a partial list.
`Result.all` is exactly that fold:

```ts
static all<T, E>(results: Array<TResult<T, E>>): TResult<Array<T>, E>
```

Look at the implementation in `result.ts`: it finds the *first* failure and short-circuits to
`Err` with that error; otherwise it unwraps every `Ok` and returns them as an array, in order.
This is deliberately "all-or-nothing," not "collect every error" — if you need every line's
errors reported together (e.g. a form with five invalid fields), `Result.all` is the wrong tool;
you'd `flatMap` the errors out yourself instead. Knowing when *not* to reach for a combinator is
as much the lesson as the combinator itself.

Reference: `../../../solutions/04-cart.service.ts`.
