import { Wallet } from ".";
import { Blockchain } from "../blockchain";
import { Transaction } from "./transaction";
import { TransactionPool } from "./transaction-pool";

let transactionPool: TransactionPool,
  wallet: Wallet,
  blockchain: Blockchain,
  transaction: Transaction | undefined;

describe("", () => {
  beforeEach(() => {
    transactionPool = new TransactionPool();
    wallet = new Wallet();
    blockchain = new Blockchain();
    transaction = wallet.createTransaction(
      "r4nd-4ddr355",
      30,
      blockchain,
      transactionPool
    );
  });

  it("adds a transaction to the pool", () => {
    expect(
      transactionPool.transactions.find((t) => t.id === transaction?.id)
    ).toEqual(transaction);
  });
  it("clears transactions", () => {
    transactionPool.clear();
    expect(transactionPool.transactions).toEqual([]);
  });
  it("updates a transaction in the pool", () => {
    const oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction?.update(wallet, "foo-4ddr355", 50);
    transactionPool.updateOrAddTransaction(newTransaction!);
    expect(
      JSON.stringify(
        transactionPool.transactions.find((t) => t.id === newTransaction?.id)
      )
    ).not.toEqual(oldTransaction);
  });
  describe("mixing valid and corrupt transactions", () => {
    let validTransactions: Transaction[] = [];
    beforeEach(() => {
      validTransactions = [...transactionPool.transactions];
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction(
          "r4nd-4ddr355",
          30,
          blockchain,
          transactionPool
        );
        if (i % 2 == 0) {
          transaction!.input!.amount = 999999;
        } else {
          validTransactions.push(transaction!);
        }
      }
    });

    it("shows a difference between valid and corrupt transactions", () => {
      expect(JSON.stringify(transactionPool.transactions)).not.toEqual(
        JSON.stringify(validTransactions)
      );
    });
    it("grabs valid transactions", () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });
  });
  describe("creating a reward transaction", () => {
    beforeEach(() => {
      transaction = Transaction.rewardTransaction(
        wallet,
        Wallet.blockchainWallet()
      );
    });

    it("reward the miner's wallet", () => {
      expect(
        transaction?.outputs.find(
          (output) => output.address === wallet.publicKey
        )?.amount
      ).toEqual(50);
    });
  });
});
