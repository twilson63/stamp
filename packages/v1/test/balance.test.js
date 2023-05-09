import { test } from "uvu";
import * as assert from "uvu/assert";
import { path, times, always } from "ramda";

import { handle } from "../src/index.js";

class ContractError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ContractError";
  }
}

globalThis.ContractError = ContractError;

const TOM = times(always("X"), 43).join("");
const JUSTIN = times(always("Y"), 43).join("");

test("should return balance for TOM", async () => {
  globalThis.SmartWeave = {};
  const STAMP = 1 * 1e6;
  const { result } = await handle(
    { balances: { [TOM]: 1000 * STAMP } },
    { caller: TOM, input: { function: "balance" } }
  );
  assert.equal(result.balance, 1000 * STAMP);
  globalThis.SmartWeave = {};
});

test("should return balance for JUSTIN", async () => {
  globalThis.SmartWeave = {};
  const STAMP = 1 * 1e6;
  const { result } = await handle(
    { balances: { [TOM]: 1000 * STAMP, [JUSTIN]: 500 * STAMP } },
    { caller: TOM, input: { target: JUSTIN, function: "balance" } }
  );
  assert.equal(result.balance, 500 * STAMP);
  globalThis.SmartWeave = {};
});

test("should return balance 0 for JUSTIN", async () => {
  globalThis.SmartWeave = {};
  const STAMP = 1 * 1e6;
  const { result } = await handle(
    { balances: { [TOM]: 1000 * STAMP } },
    { caller: TOM, input: { target: JUSTIN, function: "balance" } }
  );
  assert.equal(result.balance, 0);
  globalThis.SmartWeave = {};
});

test.run();
