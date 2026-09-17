# Lesson 06 — the controller boundary

This is the only lesson wired into the real HTTP app — `AppModule` imports `OrdersModule`.

## Task

`OrdersService.findById` is already finished (it's lesson 01's pattern, done). Fix
`OrdersController.findOne`: branch on `result.ok`.

```
pnpm start:dev
# in another terminal:
curl -i http://localhost:3000/orders/order-1
curl -i http://localhost:3000/orders/does-not-exist
```

Or without a server, the full request/response cycle via a real (in-memory) HTTP client:

```
pnpm test:e2e
```

## What this teaches

This is where `Result` stops being an internal implementation detail and meets the outside
world. A `TResult` is not an HTTP response — nothing upstream of your controller knows what
`.ok`/`.data`/`.error` mean. The controller's entire job is translating one into the other:

```ts
const result = this.ordersService.findById(id);
if (!result.ok) throw new BadRequestException(result.error);
return result.data;
```

That's it — no other shape is acceptable at this boundary in this codebase. Services return
`TResult` and never throw (aside from the exemptions in the real ruleset: a `throw` inside a
`Result.from`/`fromSync` callback, a queue handler, or a transaction callback); controllers are
the one place a `Result`'s error channel legitimately becomes a thrown `HttpException`, because
NestJS's exception filters are what turn a throw into an HTTP response — `Result` and Nest's own
error model meet exactly once, at this line, and nowhere else.

Look at `orders.service.ts` again with that in mind: it has no knowledge of HTTP, status codes,
or exceptions. You could put a completely different transport in front of it — a queue consumer,
a CLI, a cron job — and it wouldn't change. That's the payoff of keeping `Result` all the way
through the service layer: the boundary translation happens exactly once, at the edge.

Reference: `../../../solutions/06-orders.controller.ts`.
