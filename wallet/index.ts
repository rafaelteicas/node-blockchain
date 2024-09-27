import { ec } from "elliptic";
import type { Blockchain } from "../blockchain";
import { ChainUtil } from "../chain-util";
import { INITIAL_BALANCE } from "../config";
import { Transaction } from "./transaction";
import { TransactionPool } from "./transaction-pool";

export class Wallet {
  balance: number;
  keypair: ec.KeyPair;
  publicKey: string | null;

  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keypair = ChainUtil.genKeyPair();
    this.publicKey = this.keypair.getPublic().encode("hex", false);
  }

  toString() {
    return ` 
        Wallet =
          balance     : ${this.balance}
          publicKey   : ${this.publicKey?.toString()}
          keypair     : ${this.keypair?.toString()}
    `;
  }

  sign(dataHash: string) {
    return this.keypair.sign(dataHash);
  }

  createTransaction(
    recipient: string,
    amount: number,
    blockchain: Blockchain,
    transactionPool: TransactionPool
  ) {
    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds balance`);
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey!);

    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      if (!transaction) return;
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.publicKey = "blockchain-wallet";
    return blockchainWallet;
  }

  calculateBalance(blockchain: Blockchain) {
    let balance = this.balance;
    let transactions: Transaction[] = [];
    blockchain.chain.forEach((block) => {
      block.data.forEach((transaction) => {
        transactions.push(transaction);
      });
    });
    const walletInputTs = transactions.filter(
      (transaction) => transaction.input?.address === this.publicKey
    );
    let startTime: number = 0;
    if (walletInputTs.length > 0) {
      const recentInputT = walletInputTs.reduce((prev, curr) => {
        return prev.input?.timestamp! > curr.input?.timestamp! ? prev : curr;
      });
      balance = recentInputT.outputs.find(
        (output) => output.address === this.publicKey
      )?.amount!;
      startTime = recentInputT.input?.timestamp!;
    }
    transactions.forEach((transaction) => {
      if (transaction.input?.timestamp! > startTime) {
        transaction.outputs.find((output) => {
          if (output.address === this.publicKey) {
            balance += output.amount!;
          }
        });
      }
    });
    return balance;
  }
}
