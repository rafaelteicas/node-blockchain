import type { Blockchain } from "../blockchain";
import { Wallet } from "../wallet";
import { Transaction } from "../wallet/transaction";
import type { TransactionPool } from "../wallet/transaction-pool";
import type { P2PServer } from "./p2p-server";

export class Miner {
  private blockchain: Blockchain;
  private transactionPool: TransactionPool;
  private wallet: Wallet;
  private p2pServer: P2PServer;

  constructor(
    blockchain: Blockchain,
    transactionPool: TransactionPool,
    wallet: Wallet,
    p2pServer: P2PServer
  ) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  miner() {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    const block = this.blockchain.addBlock(validTransactions);
    this.p2pServer.syncChain();
    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();
    return block;
  }
}
