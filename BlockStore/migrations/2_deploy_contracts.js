const BlockStore = artifacts.require("BlockStore");

// Deploy BlockStore contract
module.exports = function(deployer) {
  deployer.deploy(BlockStore);
};