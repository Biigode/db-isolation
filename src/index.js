import { Transaction } from "sequelize";
import { createAccounts } from "./db/operations.js";
import { Accounts } from "./db/models/accounts.js";
import { sequelize } from "./db/sequelize.js";
import { readUncommitted } from "./dbIsolationTypes/readUncommitted.js";
import { readCommitted } from "./dbIsolationTypes/readCommited.js";
import { repeatableRead } from "./dbIsolationTypes/repeatableRead.js";
import { serializable,serializableConcurrentUpdate } from "./dbIsolationTypes/serializable.js";

const testIsolationLevel = async (level) => {
  try {
    switch (level) {
      case "READ UNCOMMITTED":
        await readUncommitted();
        break;
      case "READ COMMITTED":
        await readCommitted();
        break;
      case "REPEATABLE READ":
        await repeatableRead();
        break;
      case "SERIALIZABLE":
        await serializable();
        console.log(
          "Serializable isolation level does not allow concurrent inserts."
        );
        await serializableConcurrentUpdate();
        break;
      default:
        throw new Error(`Unknown isolation level: ${level}`);
    }
  } catch (err) {
    console.error("Error during transaction:", err);
  } finally {
    await Accounts.update({ balance: 1000 }, { where: { name: "Alice" } });
    await Accounts.destroy({ where: { name: "Charlie" } });
    await Accounts.destroy({ where: { name: "David" } });
    console.log("Balance reset to initial value.");
  }
};

try {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  sequelize.connectionManager.initPools();
  await createAccounts();
  const isolationLevels = [
    Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  ];
  for (const level of isolationLevels) {
    console.log("\n============================");
    console.log(`Starting test for ${level}`);
    await testIsolationLevel(level);
    console.log("============================\n");
  }
} catch (error) {
  console.error("Unable to connect to the database:", error);
}
