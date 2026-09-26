import { Result, TResult } from './result';

const ITERATIONS = 2_000_000;
const WARMUP_ITERATIONS = 100_000;
const CHAIN_ITERATIONS = 300_000;
const CHAIN_WARMUP_ITERATIONS = 20_000;

type Case = { name: string; run: () => unknown };

const withdrawResultOk = (amount: number): TResult<number, string> => {
  const isValid = amount > 0;
  if (!isValid) return Result.Err('INVALID_AMOUNT');
  return Result.Ok(amount - 1);
};

const withdrawResultErr = (amount: number): TResult<number, string> => {
  const isValid = amount > 0;
  if (isValid) throw new Error('unreachable in this benchmark');
  return Result.Err('INVALID_AMOUNT');
};

const withdrawThrowOk = (amount: number): number => {
  const isValid = amount > 0;
  if (!isValid) throw new Error('INVALID_AMOUNT');
  return amount - 1;
};

const withdrawThrowErr = (amount: number): number => {
  const isValid = amount > 0;
  if (isValid) throw new Error('unreachable in this benchmark');
  throw new Error('INVALID_AMOUNT');
};

const runCase = (testCase: Case, iterations: number, warmupIterations: number): number => {
  for (let warmupIndex = 0; warmupIndex < warmupIterations; warmupIndex += 1) testCase.run();
  const startedAt = process.hrtime.bigint();
  for (let iterationIndex = 0; iterationIndex < iterations; iterationIndex += 1) testCase.run();
  const endedAt = process.hrtime.bigint();
  const totalMs = Number(endedAt - startedAt) / 1_000_000;
  return totalMs;
};

const printTable = (args: { title: string; iterations: number; warmupIterations: number; cases: Array<Case> }): void => {
  const results = args.cases.map((testCase) => ({
    name: testCase.name,
    totalMs: runCase(testCase, args.iterations, args.warmupIterations),
  }));
  const firstResult = results[0];
  if (firstResult === undefined) throw new Error('no benchmark cases defined');
  const baselineMs = firstResult.totalMs;

  console.log(`\n${args.title} — ${args.iterations.toLocaleString()} iterations, ${args.warmupIterations.toLocaleString()} warmup\n`);
  results.forEach((entry) => {
    const perOpNs = (entry.totalMs * 1_000_000) / args.iterations;
    const relative = entry.totalMs / baselineMs;
    console.log(
      `${entry.name.padEnd(46)} ${entry.totalMs.toFixed(1).padStart(8)} ms   ${perOpNs.toFixed(1).padStart(7)} ns/op   ${relative.toFixed(2)}x`,
    );
  });
};

const singleLayerCases: Array<Case> = [
  { name: 'Result.Ok (success path)', run: () => withdrawResultOk(10) },
  { name: 'try/catch (success path, no throw)', run: () => withdrawThrowOk(10) },
  {
    name: 'Result.Err (failure path, no throw)',
    run: () => withdrawResultErr(-1),
  },
  {
    name: 'try/catch (failure path, real throw)',
    run: () => {
      try {
        withdrawThrowErr(-1);
      } catch {
        // expected control-flow error, discarded
      }
    },
  },
];

const naiveBoundary = (): number => {
  throw new Error('DB_WRITE_FAILED');
};

const naiveServiceLayer = (): number => {
  try {
    return naiveBoundary();
  } catch (e) {
    throw new Error(`service layer failed: ${(e as Error).message}`);
  }
};

const naiveDomainLayer = (): number => {
  try {
    return naiveServiceLayer();
  } catch (e) {
    throw new Error(`domain layer failed: ${(e as Error).message}`);
  }
};

const naiveControllerLayer = (): number => {
  try {
    return naiveDomainLayer();
  } catch (e) {
    throw new Error(`controller layer failed: ${(e as Error).message}`);
  }
};

const resultBoundary = (): TResult<number, Error> => Result.fromSync(() => naiveBoundary());
const resultServiceLayer = (): TResult<number, Error> => resultBoundary();
const resultDomainLayer = (): TResult<number, Error> => resultServiceLayer();
const resultControllerLayer = (): TResult<number, Error> => resultDomainLayer();

const chainCases: Array<Case> = [
  {
    name: 'try/catch (3-layer catch + rethrow)',
    run: () => {
      try {
        naiveControllerLayer();
      } catch {
        // final catch at the top, discarded
      }
    },
  },
  {
    name: 'Result (1 throw at boundary, 3-layer propagate)',
    run: () => resultControllerLayer(),
  },
];

printTable({
  title: 'Single layer',
  iterations: ITERATIONS,
  warmupIterations: WARMUP_ITERATIONS,
  cases: singleLayerCases,
});

printTable({
  title: 'Multi-layer propagation',
  iterations: CHAIN_ITERATIONS,
  warmupIterations: CHAIN_WARMUP_ITERATIONS,
  cases: chainCases,
});
