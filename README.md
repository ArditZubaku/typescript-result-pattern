# typescript-result-pattern

A hands-on workshop for the `Result<T, E>` pattern — built as a small NestJS app so the exercises look like real service/controller code, not toy snippets.

## Setup

```
pnpm install
```

## How this is organized

- **`src/result/result.ts`** — the `Result` type itself. Start by reading `src/result/README.md` and running its tests; nothing here is a TODO.
- **`src/lessons/01` → `07`** — one concept each, in order. Every lesson folder has its own `README.md` (the concept + the task), a `*.service.ts` with `TODO`s to fill in, and a `*.spec.ts` that's already fully written — your job is to make it pass, not to write it.
- **`solutions/`** — one reference implementation per lesson. Try first; peek after.

| # | Folder | Teaches |
|---|--------|---------|
| 00 | `src/result/` | The type itself: `Ok`/`Err`, `containsData`, `from`/`fromSync`, `to`, `all` |
| 01 | `01-ok-err` | `Result.Ok` / `Result.Err` — guard clauses that return instead of throw |
| 02 | `02-from-fromsync` | `Result.from` / `Result.fromSync` — adapting a throwing API |
| 03 | `03-to-combinator` | `Result.to` — mapping both channels of an existing `Result` |
| 04 | `04-all-combinator` | `Result.all` — collapsing `Array<Result>` into one `Result<Array>` |
| 05 | `05-railway` | **The main event** — composing guards/transforms/writes into one flat method |
| 06 | `06-controller` | The controller boundary: `if (!result.ok) throw new BadRequestException(...)` |
| 07 | `07-bonus-concurrent` | `concurrentOrThrow` — parallel reads without leaving the railway |

Do them in order — 05 assumes 01 and leans on the same guard-clause habits, 06 assumes a service
already returns `TResult`, 07 assumes 05.

## Running things

```
pnpm test                      # every lesson's spec, once
pnpm test --watch              # rerun on save
pnpm test wallet.service        # just one lesson, by filename
pnpm typecheck                  # tsc --noEmit — the TODOs fail this until filled in
pnpm start:dev                  # boots the app; only lesson 06 is wired to HTTP
pnpm test:e2e                   # hits the real (in-memory) HTTP endpoint from lesson 06
```

A lesson is "done" when its spec is green **and** `pnpm typecheck` is clean for that file — some
TODOs are deliberately left as an unreachable `throw` that fails typecheck ("not all code paths
return a value") before you've written a single assertion-failing line. That's intentional: let
the compiler prove you covered every branch, then let the tests prove the values are right.

## The house rules this workshop is building toward

This is the condensed version of how `Result` should be used day to day. Everything above exists to make it feel obvious by the end rather than arbitrary:

- No `try/catch` — wrap a throwable with `Result.from` / `Result.fromSync` instead.
- Fallible functions return `TResult<T, E>`; they never throw (services especially).
- Controllers are the one legitimate translation point: `if (!result.ok) throw new BadRequestException(result.error); return result.data;`
- A service method is a railway — reads and guards at the top, pure transforms in the middle, writes at the bottom, nothing nested, nothing interleaved.
- Parallel reads use `concurrentOrThrow` (let a real failure crash with its real stack); parallel writes, or anything you plan to recover from, use `concurrent` (collapses to `Result.Err`).
- Don't wrap something infallible in `Result.Ok` just to be consistent — reach for `Result` exactly where failure is real.

## Performance

- `Result.Ok(value)` / `Result.Err(error)` are just object literal allocations — `{ ok: true, value }` / `{ ok: false, error }`. Same cost class as any small object literal; **V8** inlines/escape-analyzes these trivially in hot paths.
- No stack trace capture (unlike `throw new Error()`, which is **genuinely expensive** — Error construction walks and materializes the stack even if you never read `.stack`).
- No exception unwinding — a `return Err(...)` is a normal function return; the **JIT can optimize** a function with a plain return far better than one wrapped in `try/catch` (try/catch historically deoptimized surrounding code in older V8; modern V8 has improved this, but throw/catch is still strictly heavier than return).
- The real cost is allocation pressure if you're doing this millions of times/sec in a tight loop — but that's the same cost any wrapped-value pattern (`Optional`, tagged union, boxed primitive) pays, not something specific to `Result`.

Net: Result is at worst as cheap as returning any small object, and **strictly cheaper** than the throw/catch alternative it replaces.

### Measured

`pnpm benchmark` runs `src/result/benchmark.ts` — 2,000,000 iterations per case, JIT-warmed with 100,000 iterations first:

```
Result.Ok (success path)                    2.0 ms       1.0 ns/op   1.00x
try/catch (success path, no throw)          8.6 ms       4.3 ns/op   4.35x
Result.Err (failure path, no throw)        21.1 ms      10.5 ns/op   10.60x
try/catch (failure path, real throw)     5611.1 ms    2805.6 ns/op   2822.32x
```

Both success paths sit in single-digit nanoseconds — noise, not signal. The gap opens entirely
on the *failure* path: an unthrown `Result.Err` costs ~10ns, a real `throw`/`catch` costs ~2.8µs —
**~2800x** slower. That cost is stack-trace capture and exception unwinding, not the object
allocation `Result` also pays. Numbers are from one machine/Node version and will vary — rerun
locally with `pnpm benchmark` rather than trusting these as absolute.
