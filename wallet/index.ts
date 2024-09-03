import { ec } from "elliptic";
import { ChainUtil } from "../chain-util";
import { INITIAL_BALANCE } from "../config";

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
}
