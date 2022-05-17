pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract LotteryWWT is Ownable {

    address[] public gamblers;
    uint lotteryBalance;

    ERC20 private token;

    // Event that logs deposit operation
    event DepositTokens( address sender, uint256 amount );

    // Event that logs entering the lottery
    event EnterLottery( address sender );

    // Event that logs choosing a winner
    event ChooseWinner( address winner );

    constructor( address tokenAddress ) {
        token = ERC20(tokenAddress);
        lotteryBalance = 0;
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, gamblers)));
    }

    function deposit ( uint256 amount ) public onlyOwner {
        require(token.balanceOf(msg.sender) >= amount, "there are not enough tokens to make a deposit");
        ERC20(token).transferFrom(msg.sender, address(this), amount);
        emit DepositTokens(msg.sender, amount);
    }

    function distribute( address[] calldata accounts, uint amount) public{
        require (token.balanceOf(address(this)) >= (amount*1), "there not enough tokens to send them to all of the users");
        for (uint i=0; i<amount; i++){
            token.approve(accounts[i], 1);
            ERC20(token).transfer(accounts[i], 1);
        }
    }

    function enter() public {
        require(token.balanceOf(address(msg.sender)) >= 1 , "it has to be payed 1 token");
        gamblers.push(msg.sender);
        ERC20(token).transferFrom(msg.sender, address(this), 1);
        lotteryBalance++;
        emit EnterLottery(msg.sender);
    }

    function getLotteryBalance() public view returns( uint256 ) {
        return lotteryBalance;
    }

    function chooseWinner() public onlyOwner {
        uint index = random() % gamblers.length;
        token.approve(gamblers[index], lotteryBalance);
        ERC20(token).transfer(gamblers[index], lotteryBalance);
        emit ChooseWinner(gamblers[index]);
        gamblers = new address[](0);
        lotteryBalance = 0;
    }
}