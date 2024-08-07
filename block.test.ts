import { Block } from "./block";

describe("Block Test", () => {
  let data: any;
  let lastBlock: Block;
  let block: Block;

  beforeEach(() => {
    data = "index.html";
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it("sets the `data` to match the input", () => {
    expect(block.data).toEqual(data);
  });
  it("sets the `lastHash` to match the hash of the last block", () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });
});
