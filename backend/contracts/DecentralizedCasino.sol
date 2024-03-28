// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract DecentralizedCasino is VRFConsumerBase {
    uint256 public constant ENTRY_FEE = 0.01 ether;
    uint256 public constant NUMBER_RANGE = 36;
    address payable[] public players;
    mapping(address => uint256) public playerGuesses;
    uint256 public gameStart;
    uint256 public bettingDuration = 5 minutes;
    bool public gameEnded = false;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    event GameStarted(uint256 duration);
    event PlayerEntered(address player, uint256 guess);
    event GameEnded(uint256 winningNumber);

    constructor(address _vrfCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee)
        VRFConsumerBase(_vrfCoordinator, _linkToken) {
        keyHash = _keyHash;
        fee = _fee;
    }

    function startGame() public {
        require(gameEnded, "Previous game has not ended yet.");
        gameStart = block.timestamp;
        gameEnded = false;
        emit GameStarted(bettingDuration);
    }

    function enterGame(uint256 guess) public payable {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(guess >= 1 && guess <= NUMBER_RANGE, "Guess out of range");
        require(block.timestamp <= gameStart + bettingDuration, "Betting period has ended");
        players.push(payable(msg.sender));
        playerGuesses[msg.sender] = guess;
        emit PlayerEntered(msg.sender, guess);
    }

    function endGame() public {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        require(block.timestamp > gameStart + bettingDuration, "Betting period has not ended");
        require(!gameEnded, "Game already ended");
        requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 /* requestId */, uint256 randomness) internal override {
        randomResult = randomness % NUMBER_RANGE + 1;
        distributeWinnings();
        gameEnded = true;
        emit GameEnded(randomResult);
    }

    function distributeWinnings() private {
        uint256 winnerCount = 0;
        uint256 totalReward = address(this).balance;

        // Determine the number of winners
        for (uint256 i = 0; i < players.length; i++) {
            if (playerGuesses[players[i]] == randomResult) {
                winnerCount++;
            }
        }

        // Split the pot between the winners
        if (winnerCount > 0) {
            uint256 winnerShare = totalReward / winnerCount;
            for (uint256 i = 0; i < players.length; i++) {
                if (playerGuesses[players[i]] == randomResult) {
                    payable(players[i]).transfer(winnerShare);
                }
            }
        }

        // Reset for the next game
        delete players;
    }
}
