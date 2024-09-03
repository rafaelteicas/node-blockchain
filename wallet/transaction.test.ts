import { Wallet } from ".";
import { Transaction } from "./transaction";

let wallet: Wallet;
let transaction: Transaction | undefined;
let recipient: string;
let amount: number;

describe("Wallet testt", () => {
  beforeEach(() => {
    recipient = "address";
    amount = 50;
    wallet = new Wallet();
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it("output the amount subtracted from wallet balance", () => {
    const output = transaction?.outputs.find(
      (output: any) => output.address === wallet.publicKey
    );
    expect(output.amount === wallet.balance - amount);
  });
  it("outputs `amount` added to the recipient", () => {
    const output = transaction?.outputs.find(
      (output: any) => output.address === recipient
    );
    expect(output.amount === amount);
  });
  it("inputs the balance of the wallet", () => {
    expect(transaction?.input?.amount).toEqual(wallet.balance);
  });

  describe("transacting with an amount that exceeds the balance", () => {
    beforeAll(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it("does not create the transaction", () => {
      expect(transaction).toBeUndefined();
    });
    it("validates a valid transaction", () => {
      if (!transaction) return;
      expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });
    it("invalidates a corrupt transaction", () => {
      if (!transaction) return;
      transaction.outputs[0].amount = 5000;
      expect(Transaction.verifyTransaction(transaction)).toBeUndefined();
    });
  });

  describe("updating a transaction", () => {
    if (!transaction) return;
    let nextAmount: number, nextRecipient: string;
    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = "next-address";
      transaction = transaction?.update(wallet, nextRecipient, nextAmount);
    });
    it("subtracts the next amount from the sender output", () => {
      expect(
        transaction?.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(wallet.balance - amount - nextAmount);
    });
    it("outputs an amount for the next recipient", () => {
      expect(
        transaction?.outputs.find((output) => output.address === nextRecipient)
          .amount
      ).toEqual(nextAmount);
    });
  });
});
