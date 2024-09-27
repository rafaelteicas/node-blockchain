import { Wallet } from ".";
import { Blockchain } from "../blockchain";
import { INITIAL_BALANCE } from "../config";
import { Transaction } from "./transaction";
import { TransactionPool } from "./transaction-pool";

describe("Wallet", () => {
  let wallet: Wallet, tp: TransactionPool, blockchain: Blockchain;
  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    blockchain = new Blockchain();
  });

  describe("creating a transaction", () => {
    let transaction: Transaction | undefined,
      sendAmount: number,
      recipient: string;

    beforeEach(() => {
      sendAmount = 50;
      recipient = "r4nd0m-4ddr355";
      transaction = wallet.createTransaction(
        recipient,
        sendAmount,
        blockchain,
        tp
      );
    });

    describe("and doing the same transaction", () => {
      beforeEach(() => {
        if (transaction) {
          wallet.createTransaction(recipient, sendAmount, blockchain, tp);
        }
      });

      it("doubles the `sendAmount` subtracted from the wallet balance", () => {
        if (transaction) {
          expect(
            transaction.outputs.find(
              (output) => output.address === wallet.publicKey
            )?.amount
          ).toEqual(wallet.balance - sendAmount * 2);
        }
      });

      it("clones the `sendAmount` output for the recipient", () => {
        if (transaction) {
          expect(
            transaction.outputs
              .filter((output) => output.address === recipient)
              .map((output) => output.amount)
          ).toEqual([sendAmount, sendAmount]);
        }
      });
    });
  });
  describe("calculate a balance ", () => {
    let addBalance: number, repeatAdd: number, senderWallet: Wallet;
    beforeEach(() => {
      senderWallet = new Wallet();
      addBalance = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(
          wallet.publicKey!,
          addBalance,
          blockchain,
          tp
        );
      }
      blockchain.addBlock(tp.transactions);
    });

    it("calculates the balance for blockchain transactions matching the recipient", () => {
      expect(wallet.calculateBalance(blockchain)).toEqual(
        INITIAL_BALANCE + addBalance * repeatAdd
      );
    });

    it("calculates the balance for blockchain transactions matching the sender", () => {
      expect(senderWallet.calculateBalance(blockchain)).toEqual(
        INITIAL_BALANCE - addBalance * repeatAdd
      );
    });

    describe("and the recipient conducts a transaction", () => {
      let subtractBalance: number, recipientBalance: number;
      beforeEach(() => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(blockchain);
        wallet.createTransaction(
          senderWallet.publicKey!,
          subtractBalance,
          blockchain,
          tp
        );
        blockchain.addBlock(tp.transactions);
      });
      describe("and the sender sends another transaction to the recipient", () => {
        beforeEach(() => {
          tp.clear();
          senderWallet.createTransaction(
            wallet.publicKey!,
            addBalance,
            blockchain,
            tp
          );
          blockchain.addBlock(tp.transactions);
        });
        it("calculates the recipient balance only using transactions since its most recent one", () => {
          expect(wallet.calculateBalance(blockchain)).toEqual(
            recipientBalance - subtractBalance + addBalance
          );
        });
      });
    });
  });
});
