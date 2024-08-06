import { Block } from "./block";

const primeiroBloco = Block.mineBlock(Block.genesis(), "$500");

const fooBlock = Block.mineBlock(Block.genesis(), "foo");
console.log(fooBlock.toString());
