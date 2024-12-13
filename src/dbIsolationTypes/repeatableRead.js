import { Transaction } from "sequelize";
import { sequelize } from "../db/sequelize.js";
import {readBalance,updateBalance} from '../db/operations.js'
import { Accounts } from "../db/models/accounts.js";

const repeatableRead = async () => {
  const transactionOptions = {
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  };

  const transaction1 = await sequelize.transaction(transactionOptions);
  const transaction2 = await sequelize.transaction(transactionOptions);
  const transaction3 = await sequelize.transaction(transactionOptions);

  try {
    // Leitura inicial de Alice
    const read1 = await readBalance(transaction1);
    console.log("Transaction 1 - Initial Alice balance:", read1);

    // Transação 2 tenta alterar o saldo de Alice
    console.log("Transaction 2 - Updating Alice balance...");
    await updateBalance(transaction2);

    const read2 = await readBalance(transaction1);
    console.log("Transaction 1 - Initial Alice balance (dirty read):", read2);

    // Commit imediato da transação 2 após o update
    await transaction2.commit(); // Commit da transação 2 logo após o update

    // A leitura de Alice na transação 1 não muda devido ao Repeatable Read
    const read3 = await readBalance(transaction1);
    console.log(
      "Transaction 1 - Alice balance after Transaction 2 update (No Non-Repeatable Reads):",
      read3
    );

    // Explicação: No nível Repeatable Read,
    // * Dirty Reads não ocorrem porque as transações não podem ler dados não confirmados (commitados).
    // * Non-Repeatable Reads não ocorrem porque o valor lido por uma transação não pode mudar durante sua execução, mesmo que outra transação faça alterações e comite.

    // Agora, verificamos Phantom Read
    console.log("Transaction 3 - Inserting new account for phantom read...");
    await Accounts.create(
      { name: "Charlie", balance: 300 },
      { transaction: transaction3 }
    );
    await transaction3.commit(); // Commit da transação 3

    // Transação 1 lê todas as contas (a transação 1 ainda pode ver a nova conta inserida)
    const allAccounts1 = await Accounts.findAll({ transaction: transaction1 });
    console.log(
      "Transaction 1 - All accounts after Phantom Read (insert):",
      allAccounts1.map((a) => a.name)
    );

    // Explicação: No nível Repeatable Read,
    // * Phantom Reads ocorrem porque a transação pode ver novas linhas inseridas por outras transações, mesmo que as linhas já lidas não mudem.

    // Commit final da transação 1
    await transaction1.commit();
  } catch (error) {
    console.error("Error during transactions:", error);
    await transaction1.rollback();
    await transaction2.rollback();
    await transaction3.rollback();
  }
};

export { repeatableRead };
