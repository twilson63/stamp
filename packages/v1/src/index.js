import { transfer } from "./write/transfer.js";
import { balance } from "./read/balance.js";
import { stamp } from "./write/stamp.js";
import { reward } from "./cron/reward.js";
import { credit } from "./cron/credit.js";
import { register } from "./write/register.js";
import { superStamps } from "./write/super-stamps.js";
import { evolve } from "./write/evolve.js";
import { allow } from "./write/allow.js";
import { claim } from "./write/claim.js";

const EVOLVABLE = 1241679;

export async function handle(state, action) {
  const env = {
    vouchContract: state.vouchDAO,
    readState: (contractId) =>
      SmartWeave.contracts.readContractState.bind(SmartWeave.contracts)(
        contractId
      ),
    //write: (contractId, input) => SmartWeave.contracts.write.bind(SmartWeave.contracts)(contractId, input),
    //viewState: (contractId, input) => SmartWeave.contracts.viewContractState.bind(SmartWeave.contracts)(contractId, input),
    height: SmartWeave?.block?.height,
    timestamp: SmartWeave?.block?.timestamp,
    id: SmartWeave?.transaction?.id,
    owner: SmartWeave?.transaction?.owner,
    tags: SmartWeave?.transaction?.tags,
    contractId: SmartWeave?.contract?.id,
  };

  if (action.input.function !== "balance") {
    // check for rewards on write interactions
    state = await reward(env)(state, action).toPromise().catch(handleError);
    // check for credits on write interactions
    state = credit(env)(state, action);
  }

  // handle function
  switch (action?.input?.function) {
    case "register":
      return register(env)(state, action).fold(handleError, handleSuccess);
    case "stamp":
      return stamp(env)(state, action)
        .chain(superStamps(env))
        .toPromise()
        .catch(handleError);
    case "balance":
      return balance(state, action).fold(handleError, handleSuccess);
    case "transfer":
      return transfer(state, action).fold(handleError, handleSuccess);
    case "evolve":
      return env.height < EVOLVABLE ? evolve(state, action) : { state };
    case "allow":
      return allow(env)(state, action).fold(handleError, handleSuccess);
    case "claim":
      return claim(state, action).fold(handleError, handleSuccess);
    default:
      throw new ContractError("no function defined!");
  }

  throw new ContractError("can not find function!");
}

function handleError(msg) {
  throw new ContractError(msg);
}

function handleSuccess(result) {
  return result;
}