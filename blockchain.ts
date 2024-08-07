import { Block } from "./block";

export class Blockchain {
  chain: Block[] = [];

  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data: any) {
    const block = Block.mineBlock(this.chain[this.chain.length - 1], data);
    this.chain.push(block);
    return block;
  }

  isValidChain(chain: Block[]): boolean {
    // Checa se o primeiro bloco da chain é o bloco gênesis
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      // Checa se o lastHash do bloco atual é igual ao hash do último bloco
      // Checa se o hash do bloco atual é igual ao hash gerado pelo bloco atual
      if (
        block.lastHash !== lastBlock.hash ||
        block.hash !== Block.blockHash(block)
      )
        return false;
    }
    return true;
  }

  replaceChain(chain: Block[]) {
    if (chain.length <= this.chain.length) {
      console.log("Received chain is not longer than the current chain.");
      return;
    } else if (!this.isValidChain(chain)) {
      console.log("The received chain is not valid.");
      return;
    }
    console.log("Replacing blockchain with new chain.");
    this.chain = chain;
  }
}
