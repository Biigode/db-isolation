import { Transaction } from "sequelize";
import { Accounts } from "../db/models/accounts.js";
import { sequelize } from "../db/sequelize.js";
import {readBalance,updateBalance} from '../db/operations.js'

const serializable = async () => {
  const transactionOptions = {
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  };
  // Transação 1 - Lê o saldo inicial de Alice
  const transaction1 = await sequelize.transaction(transactionOptions);
  const aliceBalance1 = await readBalance(transaction1); // Função que lê o saldo
  console.log("Transaction 1 - Initial Alice balance:", aliceBalance1);

  // Transação 2 - Atualiza o saldo de Alice
  const transaction2 = await sequelize.transaction(transactionOptions);
  console.log("Transaction 2 - Updating Alice balance...");
  await updateBalance(transaction2); // Função que atualiza o saldo
  await transaction2.commit(); // Commit da transação 2

  // Transação 1 - Tenta ler novamente o saldo de Alice
  const aliceBalance2 = await readBalance(transaction1);
  console.log(
    "Transaction 1 - Alice balance after Transaction 2 commit:",
    aliceBalance2
  );

  // Explicação: No nível Serializable, a transação 1 não pode ver o saldo atualizado pela transação 2 até que a transação 1 tenha sido comitada.
  // Além disso, o valor lido é garantido para ser consistente durante toda a transação.

  // Transação 3 - Insere nova conta "Charlie"
  const transaction3 = await sequelize.transaction(transactionOptions);
  console.log("Transaction 3 - Inserting account 'Charlie'...");
  await Accounts.create(
    { name: "Charlie", balance: 300 },
    { transaction: transaction3 }
  );
  await transaction3.commit(); // Commit da transação 3

  // Transação 1 - Lê todas as contas, não deve ver "Charlie"
  const allAccounts1 = await Accounts.findAll({ transaction: transaction1 });
  console.log(
    "Transaction 1 - Accounts after phantom insert:",
    allAccounts1.map((a) => a.name)
  );

  // Explicação: No nível Serializable, as transações são serializadas, ou seja,
  // mesmo que uma transação 1 esteja em andamento, a transação 3 não pode interferir na leitura das contas.

  // Transação 4 - Insere nova conta "David"
  const transaction4 = await sequelize.transaction(transactionOptions);
  console.log("Transaction 4 - Inserting account 'David'...");
  await Accounts.create(
    { name: "David", balance: 500 },
    { transaction: transaction4 }
  );
  await transaction4.commit(); // Commit da transação 4

  // Transação 1 - Lê todas as contas novamente
  const allAccounts2 = await Accounts.findAll({ transaction: transaction1 });
  console.log(
    "Transaction 1 - Accounts after second phantom insert:",
    allAccounts2.map((a) => a.name)
  );

  // Explicação: A transação 1 não deve ver as inserções de "David" feitas pela transação 4, pois a transação 1 está em andamento no nível **Serializable**.

  // Transação 1 - Finaliza
  await transaction1.commit();
};

const serializableConcurrentUpdate = async () => {
  const transactionOptions = {
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  };
  const transaction1 = await sequelize.transaction(transactionOptions);
  const transaction2 = await sequelize.transaction(transactionOptions);

  await Promise.all([
    (async () => {
      console.log("Transaction 2 - Updating Alice balance...");
      try {
        await updateBalance(transaction2); // Tenta atualizar o saldo de Alice
        await transaction2.commit(); // Commit da Transação 2
        console.log("Transaction 2 - Commit");
      } catch (error) {
        console.error("Transaction 2 failed:", error.message);
        await transaction2.rollback(); // Rollback em caso de falha
      }
    })(),
    (async () => {
      console.log("Transaction 1 - Updating Alice balance...");
      try {
        await updateBalance(transaction1); // Atualiza o saldo de Alice
        // await simulateDelay(2000); // Atraso para criar conflito
        await transaction1.commit(); // Commit após atraso para simular concorrência
        console.log("Transaction 1 - Commit");
      } catch (error) {
        console.error("Transaction 1 failed:", error.message);
        await transaction1.rollback(); // Rollback em caso de falha
      }
    })(),
  ]);
};

export { serializable, serializableConcurrentUpdate };
