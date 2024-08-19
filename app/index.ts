import cors from "cors";
import express from "express";
import { Blockchain } from "../blockchain";
import { P2PServer } from "./p2p-server";

const app = express();
const blockchain = new Blockchain();
const p2pServer = new P2PServer(blockchain);

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

app.listen(process.env.PORT || 3030, () => {
  console.log("Server is running on port 3030");
});

p2pServer.listen();
