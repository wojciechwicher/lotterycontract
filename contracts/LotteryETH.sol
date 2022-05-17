pragma solidity ^0.8.0;

contract LotteryETH {
    address public owner;
    address[] public gamblers;

    constructor() {
        owner = msg.sender;
    }

    modifier ownerRestricted() {
        require(msg.sender == owner, "only owner is able run the method");
        _;
    }
    
    function join() public payable {
        require(msg.value > .01 ether, "gambler has to pay at least .01 ether");
        gamblers.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, gamblers)));
    }
    
    function chooseWinner() public ownerRestricted {
        uint index = random() % gamblers.length;
        payable(gamblers[index]).transfer(address(this).balance);
        gamblers = new address[](0);
    }

    function getGamblers() public view returns ( address[] memory) {
        return gamblers;
    }
} 