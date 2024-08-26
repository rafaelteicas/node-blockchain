import { ec as EC } from "elliptic";
import { v4 as uuidv4 } from 'uuid';

export const ec = new EC("secp256k1");

export class ChainUtil {
  static genKeyPair() { 
    return ec.genKeyPair()
  }

  static id() {
    return uuidv4();
  }
}
