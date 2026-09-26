import { Result, TResult } from './result';

const ITERATIONS = 2_000_000;
const WARMUP_ITERATIONS = 100_000;

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

const runCase = (testCase: Case): number => {
  for (let warmupIndex = 0; warmupIndex < WARMUP_ITERATIONS; warmupIndex += 1) testCase.run();
  const startedAt = process.hrtime.bigint();
  for (let iterationIndex = 0; iterationIndex < ITERATIONS; iterationIndex += 1) testCase.run();
  const endedAt = process.hrtime.bigint();
  const totalMs = Number(endedAt - startedAt) / 1_000_000;
  return totalMs;
};

const cases: Array<Case> = [
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

const results = cases.map((testCase) => ({ name: testCase.name, totalMs: runCase(testCase) }));

const firstResult = results[0];
if (firstResult === undefined) throw new Error('no benchmark cases defined');
const baselineMs = firstResult.totalMs;

console.log(`\n${ITERATIONS.toLocaleString()} iterations, ${WARMUP_ITERATIONS.toLocaleString()} warmup\n`);
results.forEach((entry) => {
  const perOpNs = (entry.totalMs * 1_000_000) / ITERATIONS;
  const relative = entry.totalMs / baselineMs;
  console.log(
    `${entry.name.padEnd(38)} ${entry.totalMs.toFixed(1).padStart(8)} ms   ${perOpNs.toFixed(1).padStart(7)} ns/op   ${relative.toFixed(2)}x`,
  );
});
