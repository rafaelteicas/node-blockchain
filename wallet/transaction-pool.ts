import { Transaction } from "./transaction";

export class TransactionPool {
  transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction: Transaction): void {
    const transactionWithId = this.transactions.findIndex(
      (t) => t.id === transaction.id
    );
    if (transactionWithId >= 0) {
      this.transactions[transactionWithId] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address: string) {
    return this.transactions.find((t) => t.input?.address === address);
  }

  validTransactions() {
    return this.transactions.filter((t) => {
      const outputTotal = t.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);
      if (t.input?.amount !== outputTotal) {
        console.log(`Invalid transaction from ${t.input?.address}`);
        return;
      }
      if (!Transaction.verifyTransaction(t)) {
        console.log(`Invalid signature from ${t.input?.address}`);
        return;
      }
    });
  }

  clear() {
    this.transactions = [];
  }
}
