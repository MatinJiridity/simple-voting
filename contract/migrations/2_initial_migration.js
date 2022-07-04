const Votting = artifacts.require("Votting");

module.exports = function (deployer) {
  deployer.deploy(Votting);
};
