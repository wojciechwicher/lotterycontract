var WWToken = artifacts.require("WWToken");
var LotteryWWT = artifacts.require("LotteryWWT");
var LotteryETH = artifacts.require("LotteryETH");

module.exports = async function (deployer) {
  await deployer.deploy(WWToken);

  const instance = await WWToken.deployed();

  await deployer.deploy(LotteryWWT, instance.address);

  await deployer.deploy(LotteryETH);
};
