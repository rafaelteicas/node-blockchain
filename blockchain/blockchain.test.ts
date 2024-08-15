import { Blockchain } from ".";
import { Block } from "./block";

describe("Blockchain", () => {
  let bc: Blockchain;
  let bc2: Blockchain;

  beforeEach(() => {
    bc = new Blockchain();
    bc2 = new Blockchain();
  });

  it("starts with genesis block", () => {
    expect(bc.chain[0]).toEqual(Block.genesis());
  });

  it("adds a new block", () => {
    const data = "index.html";
    bc.addBlock(data);
    expect(bc.chain[bc.chain.length - 1].data).toEqual(data);
  });

  it("validate a valid chain", () => {
    bc2.addBlock("new block");
    expect(bc.isValidChain(bc2.chain)).toBe(true);
  });

  it("invalidates a chain with a corrupt genesis block", () => {
    bc2.chain[0].data = "Corrupt data";
    expect(bc.isValidChain(bc2.chain)).toBe(false);
  });

  it("invalidate a corrupt chain", () => {
    bc2.addBlock("new block");
    bc2.chain[1].data = "Corrupt data";
    expect(bc.isValidChain(bc2.chain)).toBe(false);
  });

  it("replaces the chain with a valid chain", () => {
    bc2.addBlock("new block");
    bc.replaceChain(bc2.chain);
    expect(bc.chain).toEqual(bc2.chain);
  });

  it("does not replace the chain with one of less than or equal length", () => {
    bc.addBlock("new block");
    bc.replaceChain(bc2.chain);
    expect(bc.chain).not.toEqual(bc2.chain);
  });
});
