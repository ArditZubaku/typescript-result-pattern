# Lesson 07 (bonus) — parallel reads without leaving the railway

## Task

Implement `DashboardService.loadDashboard`: fetch the username and balance in parallel with
`concurrentOrThrow`, guard on a negative balance, return `Ok`.

```
pnpm test dashboard.service
```

## What this teaches

Look at `src/result/concurrent.ts` first — two functions, `concurrent` and `concurrentOrThrow`,
that look almost identical. The difference is what they do with a rejection:

- **`concurrent`** — `Promise.allSettled`, and a rejection becomes `Result.Err(reason)`. Use this
  for parallel **writes**, or any parallel operation whose failure you intend to recover from.
- **`concurrentOrThrow`** — literally `Promise.all`. A rejection propagates as a real rejection.
  Use this for parallel **reads**. If the database is unreachable, that's not a value your
  `TResult<T, E>` error type was ever designed to represent — you want the app to crash with the
  original error and stack, not silently hand back `Result.Err(null)` and have some caller treat
  "the DB is down" the same as "this row doesn't exist."

That distinction — same mechanism, opposite intent, communicated entirely by which function name
you reach for — is worth sitting with. The name documents the caller's decision about failure
handling; nothing about the implementation forces it.

The other point: `fetchUsername` and `fetchBalanceCents` don't depend on each other, so two
sequential `await`s would still be _correct_, just slower than necessary for no reason — a bug
of omission, not of logic. `concurrentOrThrow` is the one-line fix, "sequential `await` chains where the calls do not depend on each other are a bug," not just a suggestion.

This still fits the railway from lesson 05 — it's just that the first step of the railway is now
one parallel read instead of one sequential read. Guard, transform, and return stay exactly the
same shape.

Reference: `../../../solutions/07-dashboard.service.ts`.
