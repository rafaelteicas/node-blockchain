import { SHA256 } from "crypto-js";
import { DIFFICULTY, MINE_RATE } from "../config";

export class Block {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: string;
  nonce: number;
  difficulty: number;

  constructor(
    timestamp: number,
    lastHash: string,
    hash: string,
    data: any,
    nonce: number,
    difficulty: number
  ) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }

  toString() {
    return `
          Block =
            Timestamp   : ${this.timestamp}
            lastHash    : ${this.lastHash.substring(0, 10)}
            hash        : ${this.hash.substring(0, 10)}
            data        : ${this.data}
            nonce       : ${this.nonce}
            difficulty  : ${this.difficulty}
          `;
  }

  static genesis() {
    return new this(
      0,
      "-----",
      "KijdaohfSDO[1324ASDF13R589HASFTRHGK",
      [],
      0,
      DIFFICULTY
    );
  }

  static mineBlock(lastBlock: Block, data: any) {
    let hash;
    let timestamp = 0;
    const lastHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;
    let nonce = 0;
    do {
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));
    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  static adjustDifficulty(lastBlock: Block, timestamp: number) {
    let { difficulty } = lastBlock;
    difficulty =
      Number(lastBlock.timestamp) + MINE_RATE > timestamp
        ? difficulty + 1
        : difficulty - 1;
    return difficulty;
  }

  static hash(
    timestamp: number,
    lastHash: string,
    data: any,
    nonce: number,
    difficulty: number
  ) {
    return SHA256(timestamp + lastHash + data + nonce + difficulty).toString();
  }

  static blockHash(block: Block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }
}
