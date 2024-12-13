# Database Isolation Level

Este projeto é responsável por ensinar sobre níveis de isolamento em banco de dados usando PostgreSQL.

## Requisitos

- Node.js versão 23.3.0 ou superior

## Instalação

Para instalar as dependências do projeto, execute:

```sh
npm install
```

```sh
docker run --name postgres-container \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=isolation_study \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres
```

```sh
node --env-file=.env index.js
```

# **Database Isolation Levels - Study Project**

Este projeto foi desenvolvido para estudar e experimentar os diferentes níveis de isolamento de transações em bancos de dados, com exemplos práticos utilizando **Node.js** e **PostgreSQL**.

## **Introdução**

Quando múltiplas transações são executadas simultaneamente em um banco de dados, podem ocorrer problemas como:

- **Dirty Reads**: Uma transação lê dados modificados por outra transação que ainda não foi confirmada.
- **Non-Repeatable Reads**: Uma transação lê o mesmo dado duas vezes e obtém valores diferentes porque outra transação o alterou entre as leituras.
- **Phantom Reads**: Uma transação executa a mesma consulta duas vezes e obtém resultados diferentes porque outra transação inseriu ou removeu registros.

Os níveis de isolamento determinam como e quando os efeitos de uma transação se tornam visíveis para outras.

---

## **Níveis de Isolamento**

No contexto de transações em banco de dados, os níveis de isolamento determinam como as mudanças feitas em uma transação são visíveis para outras transações e como as transações simultâneas interagem entre si. Existem quatro níveis de isolamento padrão definidos pelo SQL, cada um com características distintas em relação aos problemas que podem ocorrer.

---

### **Tabela Comparativa dos Níveis de Isolamento**

| **Nível de Isolamento** | **Dirty Reads** | **Non-Repeatable Reads** | **Phantom Reads** | **Uso Comum**                                                                        |
| ----------------------- | --------------- | ------------------------ | ----------------- | ------------------------------------------------------------------------------------ |
| **Read Uncommitted**    | ✅ Permitido    | ✅ Possível              | ✅ Possível       | Cenários de baixa criticidade onde desempenho é mais importante que consistência.    |
| **Read Committed**      | ❌ Evitado      | ✅ Possível              | ✅ Possível       | Padrão para muitos bancos de dados, garantindo que dados lidos sejam confirmados.    |
| **Repeatable Read**     | ❌ Evitado      | ❌ Evitado               | ✅ Possível       | Cenários que exigem leituras consistentes, mas aceitam leituras fantasmas.           |
| **Serializable**        | ❌ Evitado      | ❌ Evitado               | ❌ Evitado        | Cenários críticos, como sistemas financeiros, onde a consistência total é essencial. |

---

### **Descrição dos Níveis de Isolamento**

#### 1. **Read Uncommitted** (Leitura Não Confirmada)

- **Descrição**: Permite que transações leiam dados que ainda não foram confirmados (ou seja, que podem ser revertidos).
- **Problemas possíveis**:
  - **Dirty Reads**: Leitura de dados não confirmados que podem ser desfeitos.
  - **Non-Repeatable Reads**: Leituras podem mudar entre execuções dentro da mesma transação.
  - **Phantom Reads**: Leituras de registros inconsistentes devido a novas inserções ou alterações feitas por outras transações.
- **Uso típico**: Cenários onde a consistência não é essencial, como logs ou estatísticas temporárias.

#### 2. **Read Committed** (Leitura Confirmada)

- **Descrição**: Garante que transações só leiam dados que foram confirmados.
- **Problemas possíveis**:
  - **Non-Repeatable Reads**: Leituras podem ser diferentes se outra transação alterar os dados entre as leituras.
  - **Phantom Reads**: Inserções ou exclusões feitas por outras transações podem afetar os resultados.
- **Uso típico**: Padrão em muitos bancos de dados devido ao equilíbrio entre desempenho e consistência.

#### 3. **Repeatable Read** (Leitura Repetível)

- **Descrição**: Garante que leituras repetidas de um mesmo dado retornem o mesmo valor durante toda a transação.
- **Problemas possíveis**:
  - **Phantom Reads**: Novos registros podem aparecer devido a inserções feitas por outras transações.
- **Uso típico**: Relatórios financeiros ou sistemas onde consistência de leituras é importante.

#### 4. **Serializable** (Serializável)

- **Descrição**: Garante que as transações sejam executadas de forma completamente isolada, como se fossem processadas em série. Isso é feito usando bloqueios de intervalo (**range locks**) ou verificação de conflitos.
- **Problemas possíveis**: Nenhum problema relacionado a leituras concorrentes, mas pode impactar significativamente o desempenho devido ao alto grau de isolamento.
- **Uso típico**: Sistemas críticos que exigem consistência total, como bancos ou sistemas de estoque.

---

### **Exemplo de Problemas Evitados ou Permitidos**

| **Problema**             | **Descrição**                                                                                            | **Exemplo**                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Dirty Reads**          | Leitura de dados não confirmados.                                                                        | Transação 1 lê um saldo atualizado por Transação 2 que depois é desfeita (rollback).             |
| **Non-Repeatable Reads** | Leitura de valores diferentes para a mesma consulta dentro da mesma transação.                           | Transação 1 lê um saldo, Transação 2 altera e confirma, e Transação 1 lê o saldo novamente.      |
| **Phantom Reads**        | Leituras retornam diferentes conjuntos de registros devido a inserções ou exclusões por outra transação. | Transação 1 consulta contas, Transação 2 insere uma nova conta e Transação 1 consulta novamente. |

---

### **Considerações**

Escolher o nível de isolamento correto depende do equilíbrio necessário entre **desempenho** e **consistência**:

- Use **Read Uncommitted** para alta performance onde consistência não é crítica.
- Use **Serializable** apenas onde a consistência total justifica o impacto no desempenho.

## **Configuração do Ambiente**

### 1. **Pré-requisitos**

- [Node.js](https://nodejs.org/) (v23.3.0+)
- [PostgreSQL](https://www.postgresql.org/) (v12+)
- [Docker](https://www.docker.com/) (opcional, para rodar o PostgreSQL em container)

## 2. **Configurar Banco de Dados**

### Execute o seguinte comando para criar um container PostgreSQL:

```bash
docker run --name postgres-container -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=isolation_study -p 5432:5432 -d postgres
```

## 3. **Instalar Dependências**

```sh
npm install
```

## 4. **Executar o Projeto**

---

```sh
node --env-file=.env index.js
```
