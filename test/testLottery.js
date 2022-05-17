const LotteryETH = artifacts.require("LotteryETH");

contract("LotteryETH", (accounts) => {
  let lotteryETH;

  beforeEach(async () => {
    lotteryETH = await LotteryETH.new();
  }); 

  describe("LotteryETH tests", async () => {
    it("deploys a contract", () => {
      assert.ok(lotteryETH.address);
    });

    it("allows one account to join the lottery", async () => {
      await lotteryETH.join({ from: accounts[0], value: web3.utils.toWei("0.02", "ether")});
      const gamblers = await lotteryETH.getGamblers({
        from: accounts[0],
      });
  
      assert.equal(accounts[0], gamblers[0]);
      assert.equal(1, gamblers.length);
    });

    it("allows multiple accounts to join lottery", async () => {
      await lotteryETH.join({
        from: accounts[0],
        value: web3.utils.toWei("0.02", "ether"),
      });
      await lotteryETH.join({
        from: accounts[1],
        value: web3.utils.toWei("0.02", "ether"),
      });
      await lotteryETH.join({
        from: accounts[2],
        value: web3.utils.toWei("0.02", "ether"),
      });
  
      const gamblers = await lotteryETH.getGamblers({
        from: accounts[0],
      });
  
      assert.equal(accounts[0], gamblers[0]);
      assert.equal(accounts[1], gamblers[1]);
      assert.equal(accounts[2], gamblers[2]);
      assert.equal(3, gamblers.length);
    });

    it("requires a minimum amount of ether to join the lottery", async () => {
      try {
        await lotteryETH.join({
          from: accounts[0],
          value: web3.utils.toWei("0", "ether"),
        });
        assert(false);
      } catch (err) {
        assert.include( err.message, 'gambler has to pay at least .01 ether', 'not enough ether' );
      }
    });

    it("only owner can call chooseWinner", async () => {
      try {
        await lotteryETH.chooseWinner({
          from: accounts[1],
        });
        assert(false);
      } catch (err) {
        assert.include( err.message, 'only owner is able run the method', 'chooseWinner() has to be run by owner' );
      }
    });

    it("sends money to the winner and resets the gamblers array", async () => {
      await lotteryETH.join({
        from: accounts[0],
        value: web3.utils.toWei("2", "ether"),
      });
  
      const initialBalance = await web3.eth.getBalance(accounts[0]);
      await lotteryETH.chooseWinner({ from: accounts[0] });
      const finalBalance = await web3.eth.getBalance(accounts[0]);
      const difference = finalBalance - initialBalance;
  
      assert(difference > web3.utils.toWei("1.8", "ether"));
    });

  });
});
