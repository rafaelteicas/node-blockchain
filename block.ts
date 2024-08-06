import { SHA256 } from "crypto-js";

export class Block {
  timestamp: number | string;
  lastHash: string;
  hash: string;
  data: string;

  constructor(
    timestamp: number | string,
    lastHash: string,
    hash: string,
    data: any
  ) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  toString() {
    return `
          Block =
            Timestamp : ${this.timestamp}
            lastHash  : ${this.lastHash.substring(0, 10)}
            hash      : ${this.hash.substring(0, 10)}
            data      : ${this.data}
          `;
  }

  static genesis() {
    return new this(
      "Genesis Time",
      "-----",
      "KijdaohfSDO[1324ASDF13R589HASFTRHGK",
      []
    );
  }

  static mineBlock(lastBlock: Block, data: any) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const hash = Block.hash(timestamp, lastHash, data);

    return new this(timestamp, lastHash, hash, data);
  }

  static hash(timestamp: number, lastHash: string, data: any) {
    return SHA256(timestamp + lastHash + data).toString();
  }
}
