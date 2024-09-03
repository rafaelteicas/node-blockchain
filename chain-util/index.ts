import { SHA256 } from "crypto-js";
import { ec as EC, SignatureInput } from "elliptic";
import { v4 as uuidv4 } from "uuid";

export const ec = new EC("secp256k1");

export class ChainUtil {
  static genKeyPair() {
    return ec.genKeyPair();
  }

  static id() {
    return uuidv4();
  }

  static hash(data: any) {
    return SHA256(JSON.stringify(data)).toString();
  }

  static verifySignature(
    publicKey: string,
    signature: SignatureInput,
    dataHash: string
  ) {
    return ec.keyFromPublic(publicKey, "hex").verify(dataHash, signature);
  }
}
