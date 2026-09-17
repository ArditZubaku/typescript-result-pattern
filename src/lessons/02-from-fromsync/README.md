# Lesson 02 — `Result.from` / `Result.fromSync`

## Task

`ConfigService.parse` wraps `JSON.parse`, which throws on bad input. `ConfigService.fetchRemoteFlag`
wraps a caller-supplied async `loader`, which may reject. Implement both using `Result.fromSync`
and `Result.from` — no `try/catch` in your solution.

```
pnpm test config.service
```

## What this teaches

`Result.Ok`/`Result.Err` (lesson 01) are for logic *you* control. `Result.from`/`Result.fromSync`
are for the opposite case: a function you don't control that communicates failure the old way —
by throwing. They're the adapter between "the rest of the world" and the `Result` world:

```ts
Result.fromSync(() => JSON.parse(raw));         // sync throwable -> TResult<T, Error>
await Result.from(() => fetch(url));             // async throwable -> Promise<TResult<T, Error>>
```

Both default the error type to `Error` — you didn't build the error, you just caught it. This is a rule stated directly: **no try/catch — use `Result.from(() => throwable())`**.
Every place you'd otherwise reach for try/catch, reach for one of these instead.

One asymmetry worth noticing: `fromSync` takes a plain function, `from` takes one that returns a
promise (or is `async`) — and `from` itself returns a `Promise`. You can't use `fromSync` to
catch a rejected promise; the `try/catch` inside it never sees the rejection, because the promise
rejects *after* the synchronous function has already returned successfully.

Reference: `../../../solutions/02-config.service.ts`.
