import { SignatureInput } from "elliptic";
import { Wallet } from ".";
import { ChainUtil } from "../chain-util";
import { MINING_REWARD } from "../config";

type Input = {
  timestamp: number;
  amount: number;
  address: string;
  signature: SignatureInput;
};

export class Transaction {
  id: string;
  input: Input | null;
  outputs: any[];

  constructor() {
    this.id = ChainUtil.id();
    this.input = null;
    this.outputs = [];
  }

  update(senderWallet: Wallet, recipient: string, amount: number) {
    const senderOutput = this.outputs.find(
      (output) => output.address === senderWallet.publicKey
    );
    if (amount > senderOutput.amount) {
      console.log(`Amount ${amount} exceeds balance`);
      return;
    }
    senderOutput.amount = senderOutput.amount - amount;
    this.outputs.push({
      amount,
      address: recipient,
    });
    Transaction.signTransaction(this, senderWallet);
    return this;
  }

  static newTransaction(
    senderWallet: Wallet,
    recipient: string,
    amount: number
  ): Transaction | undefined {
    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance`);
      return;
    }

    return Transaction.transactionWithOutputs(senderWallet, [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
      },
      {
        amount,
        address: recipient,
      },
    ]);
  }

  static rewardTransaction(minerWallet: Wallet, blockchainWallet: Wallet) {
    return Transaction.transactionWithOutputs(blockchainWallet, [
      {
        amount: MINING_REWARD,
        address: minerWallet.publicKey,
      },
    ]);
  }

  static signTransaction(transaction: Transaction, senderWallet: Wallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey || "",
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs)),
    };
  }

  static transactionWithOutputs(senderWallet: Wallet, outputs: any[]) {
    const transaction = new this();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static verifyTransaction(transaction: Transaction) {
    if (!transaction || !transaction.input) return;
    return ChainUtil.verifySignature(
      transaction.input?.address,
      transaction.input?.signature,
      ChainUtil.hash(transaction.outputs)
    );
  }
}
