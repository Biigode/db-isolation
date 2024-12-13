import { Transaction } from "sequelize";
import { Accounts } from "../db/models/accounts.js";
import { sequelize } from "../db/sequelize.js";
import {readBalance,updateBalance} from '../db/operations.js'

const readUncommitted = async () => {
  const transactionOptions = {
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
  };

  const transaction1 = await sequelize.transaction(transactionOptions);
  const transaction2 = await sequelize.transaction(transactionOptions);
  const transaction3 = await sequelize.transaction(transactionOptions);
  const transaction4 = await sequelize.transaction(transactionOptions);

  try {

    const allAccounts2 = await Accounts.findAll({ transaction: transaction1 }); // Consulta todas as contas
    console.log(
      "Transaction 1 - Accounts after phantom insert:",
      allAccounts2.map((acc) => acc.name)
    );

    // Dirty Read: Leitura de dados não confirmados
    await updateBalance(transaction2); // Modifica saldo de Alice
    const read1 = await readBalance(transaction1); // Leitura antes do commit/rollback
    console.log("Transaction 1 - Alice balance (Dirty Read):", read1);
    await transaction2.rollback(); // Reverte a mudança

    // Non-Repeatable Read: Leitura de valores alterados por outra transação
    await updateBalance(transaction3); // Atualiza saldo de Alice
    await transaction3.commit(); // Commit confirma a alteração
    const read2 = await readBalance(transaction1); // Leitura após commit
    console.log("Transaction 1 - Alice balance (Non-Repeatable Read):", read2);

    // Phantom Read: Mudança no conjunto de resultados
    await Accounts.create(
      { name: "Charlie", balance: 300 },
      { transaction: transaction4 }
    ); // Insere uma nova conta
    await transaction4.commit(); // Commit confirma a inserção
    const allAccounts = await Accounts.findAll({ transaction: transaction1 }); // Consulta todas as contas
    console.log(
      "Transaction 1 - Accounts after phantom insert:",
      allAccounts.map((acc) => acc.name)
    );

    await transaction1.commit(); // Finaliza transação 1
  } catch (error) {
    console.error("Error during transactions:", error);
    await transaction1.rollback();
    await transaction2.rollback();
    await transaction3.rollback();
    await transaction4.rollback();
  }
};

export { readUncommitted };
