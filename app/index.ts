import cors from "cors";
import express from "express";
import { Blockchain } from "../blockchain";
import { Wallet } from "../wallet";
import { TransactionPool } from "../wallet/transaction-pool";
import { Miner } from "./miner";
import { P2PServer } from "./p2p-server";

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2PServer(blockchain, tp);
const miner = new Miner(blockchain, tp, wallet, p2pServer);

app.use(cors());
app.use(express.json());

app.post("/mine", (req, res) => {
  blockchain.addBlock(req.body.data);
  p2pServer.syncChain();
  res.redirect("/blocks");
});

app.get("/blocks", (_, res) => {
  res.send(JSON.parse(JSON.stringify(blockchain.chain)));
});

app.get("/transactions", (req, res) => {
  res.json(tp.transactions);
});

app.post("/transact", (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(
    recipient,
    amount,
    blockchain,
    tp
  );
  if (!transaction) return;
  p2pServer.broadcastTransaction(transaction);
  res.redirect("/transactions");
});

app.get("/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.listen(process.env.PORT || 3030, () => {
  console.log("Server is running on port 3030");
});

app.get("/mine-transactions", (req, res) => {
  const block = miner.miner();
  console.log(`New block added: ${block.toString()}`);
  res.redirect("/blocks");
});

p2pServer.listen();
