import { Transaction } from "sequelize";
import { Accounts } from "../db/models/accounts.js";
import { readBalance, updateBalance } from "../db/operations.js";
import { sequelize } from "../db/sequelize.js";

const readCommitted = async () => {
  const transactionOptions = {
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  };

  const transaction1 = await sequelize.transaction(transactionOptions);
  const transaction2 = await sequelize.transaction(transactionOptions);
  const transaction3 = await sequelize.transaction(transactionOptions);
  const transaction4 = await sequelize.transaction(transactionOptions);

  try {
    // Demonstrando que Dirty Reads não são possíveis
    console.log("Transaction 2 - Updating Alice balance...");
    await updateBalance(transaction2);

    console.log(
      "Transaction 1 - Trying to read Alice balance (Dirty Read attempt)..."
    );
    const read1 = await readBalance(transaction1);
    console.log("Transaction 1 - Alice balance (No Dirty Read):", read1);

    // Commit ou rollback precisa ocorrer antes que os dados sejam visíveis
    await transaction2.commit();

    // Agora a transação 1 pode ler os dados confirmados
    const read2 = await readBalance(transaction1);
    console.log(
      "Transaction 1 - Alice balance after Transaction 2 commit:",
      read2
    );

    // Non-Repeatable Read: Alteração entre leituras
    console.log("Transaction 3 - Updating Alice balance again...");
    await updateBalance(transaction3);
    await transaction3.commit();

    const read3 = await readBalance(transaction1);
    console.log(
      "Transaction 1 - Alice balance after Transaction 3 commit (Non-Repeatable Read):",
      read3
    );

    // Phantom Read: Mudança no conjunto de resultados
    console.log("Transaction 1 - Checking accounts before new insert...");
    const allAccountsBefore = await Accounts.findAll({
      transaction: transaction1,
    });
    console.log(
      "Transaction 1 - Accounts before insert:",
      allAccountsBefore.map((a) => a.name)
    );

    console.log("Transaction 3 - Inserting a new account...");
    await Accounts.create(
      { name: "Charlie", balance: 300 },
      { transaction: transaction4 }
    );
    await transaction4.commit();

    const allAccountsAfter = await Accounts.findAll({
      transaction: transaction1,
    });
    console.log(
      "Transaction 1 - Accounts after insert (Phantom Read):",
      allAccountsAfter.map((a) => a.name)
    );

    await transaction1.commit();
  } catch (error) {
    console.error("Error during transactions:", error);
    await transaction1.rollback();
    await transaction2.rollback();
    await transaction3.rollback();
    await transaction4.rollback();
  }
};

export { readCommitted };
