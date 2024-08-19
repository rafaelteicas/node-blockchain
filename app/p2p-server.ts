import { WebSocket } from "ws";
import { Blockchain } from "../blockchain";
const P2P_PORT = process.env.P2P_PORT ? parseInt(process.env.P2P_PORT) : 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

export class P2PServer {
  blockchain: Blockchain;
  socket: any[];

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
    this.socket = [];
  }

  listen() {
    const server = new WebSocket.Server({ port: P2P_PORT });
    server.on("connection", (socket) => this.connectSocket(socket));
    this.connectToPeers();
    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
  }

  connectToPeers() {
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  connectSocket(socket: WebSocket) {
    this.socket.push(socket);
    this.messageHandler(socket);
    this.sendChain(socket);
    console.log("Socket connected");
  }

  sendChain(socket: WebSocket) {
    socket.send(JSON.stringify(this.blockchain.chain));
  }

  messageHandler(socket: WebSocket) {
    socket.on("message", (message) => {
      const data = JSON.parse(message.toString());
      this.blockchain.replaceChain(data);
    });
  }

  syncChain() {
    this.socket.forEach((socket) => {
      this.sendChain(socket);
    });
  }
}
