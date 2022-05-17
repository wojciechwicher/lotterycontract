const WWToken = artifacts.require("WWToken");
const LotteryWWT = artifacts.require("LotteryWWT");

contract("LotteryWWT", (accounts) => {
  let wWToken;
  let lotteryWWT;
  let balance;

  describe("LotteryWWT tests", async () => {

    before(async () => {
      wWToken = await WWToken.deployed();
      lotteryWWT = await LotteryWWT.deployed(wWToken.address);
    }); 

    it("try to enter the lottery witout WWT tokens", async () => {
      try {
        await lotteryWWT.enter({ from: accounts[1], });
        assert(false);
      } catch (err) {
        assert.include( err.message, 'it has to be payed 1 token', 'user has to have at least 1 WWT token' );
      }
    });

    it("distribute tokens to users", async () => {
      balance = await wWToken.balanceOf(accounts[0]);
      assert.equal(balance.toString(), "1000000000000000000000", "The balance for account[0] of wWTokenA should be 1000000000000000000000");
      await wWToken.approve(lotteryWWT.address, 1000, {from: accounts[0],});
      await lotteryWWT.deposit( 1000, { from: accounts[0], });
      balance = await wWToken.balanceOf(accounts[0]);
      assert.equal(balance.toString(), "999999999999999999000", "The balance for account[0] of wWTokenA should be 999999999999999999000");
      balance = await wWToken.balanceOf(accounts[1]);
      assert.equal(balance.toString(), "0", "The balance for account[1] of wWTokenA should be 0");
      balance = await wWToken.balanceOf(lotteryWWT.address);
      assert.equal(balance.toString(), "1000", "LotteryWWT contract of wWTokenA should be 1000");
      await lotteryWWT.distribute(accounts, 10);
      balance = await wWToken.balanceOf(accounts[1]);
      assert.equal(balance.toString(), "1", "The balance for account[1] of wWTokenA should be 1");
      balance = await wWToken.balanceOf(accounts[9]);
      assert.equal(balance.toString(), "1", "The balance for account[9] of wWTokenA should be 1");
    });

    it("users enters to lottery", async () => {
      balance = await wWToken.balanceOf(accounts[1]);
      assert.equal(balance.toString(), "1", "The balance for account[1] of wWTokenA should be 1");
      await wWToken.approve(lotteryWWT.address, 1, {from: accounts[1],});
      await lotteryWWT.enter({ from: accounts[1], });
      balance = await wWToken.balanceOf(accounts[1]);
      assert.equal(balance.toString(), "0", "The balance for account[1] of wWTokenA should be 0");
      balance = await lotteryWWT.getLotteryBalance();
      await wWToken.approve(lotteryWWT.address, 1, {from: accounts[2],});
      await lotteryWWT.enter({ from: accounts[2], });
      await wWToken.approve(lotteryWWT.address, 1, {from: accounts[3],});
      await lotteryWWT.enter({ from: accounts[3], });
      balance = await lotteryWWT.getLotteryBalance();
      assert.equal(balance.toString(), "3", "LotteryWWT contract balance of wWTokenA should be 3");
    });

    it("only manager can call chooseWinner", async () => {
      try {
        await lotteryWWT.chooseWinner({
          from: accounts[1],
        });
        assert(false);
      } catch (err) {
        assert.include( err.message, 'caller is not the owner', 'chooseWinner() has to be run by owner' );
      }
    });

    it("sends money to the winner and resets the gamblers array", async () => {
      balance = await lotteryWWT.getLotteryBalance();
      assert.equal(balance.toString(), "3", "LotteryWWT contract balance of wWTokenA should be 3");

      await lotteryWWT.chooseWinner({
        from: accounts[0],
      });

      balance = await lotteryWWT.getLotteryBalance();
      assert.equal(balance.toString(), "0", "LotteryWWT contract balance of wWTokenA should be 0");
    });


  });
});
