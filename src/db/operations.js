import { Accounts } from "./models/accounts.js";
import { sequelize } from "./sequelize.js";

const createAccounts = async () => {
  const alice = Accounts.build({ name: "Alice", balance: 1000 });
  await alice.save();
};

const readBalance = async (transaction) => {
  const res = await Accounts.findOne({
    where: { name: "Alice" },
    transaction,
  });
  if (!res) {
    throw new Error("Alice não foi encontrada no banco de dados.");
  }
  return res.balance;
};

const updateBalance = async (transaction) => {
  await Accounts.update(
    { balance: sequelize.literal("balance - 200") },
    { where: { name: "Alice" }, transaction }
  );
  console.log("Client updates Alice balance...");
};

const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export { createAccounts, readBalance, simulateDelay, updateBalance };
