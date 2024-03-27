pragma solidity ^0.8.0;

contract DecentralizedCasino {
    uint256 public entryFee = 0.01 ether;
    uint256 public constant MAX_NUMBER = 36;
    uint256 public currentRound;
    mapping(uint256 => mapping(address => uint256)) public playerBets;
    mapping(uint256 => address[]) public roundParticipants;
    mapping(uint256 => uint256) public roundToWinningNumber;

    event RoundEnded(uint256 round, uint256 winningNumber);

    constructor() {
        currentRound = 1;
    }

    function enterGame(uint256 guessedNumber) external payable {
        require(msg.value == entryFee, "Incorrect entry fee");
        require(guessedNumber >= 1 && guessedNumber <= MAX_NUMBER, "Number out of bounds");
        playerBets[currentRound][msg.sender] = guessedNumber;
        roundParticipants[currentRound].push(msg.sender);
    }

    function generateRandomNumber(uint256 round) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, roundParticipants[round])));
    }

    // function which is used after winnings are distributed in order to clear context for new round
    function endRound() external {
        uint256 winningNumber = generateRandomNumber(currentRound) % MAX_NUMBER + 1;
        roundToWinningNumber[currentRound] = winningNumber;
        distributeWinnings(currentRound, winningNumber);

        // Increment currentRound here to move to the next round
        currentRound++;
        
        emit RoundEnded(currentRound, winningNumber);
    }

    function distributeWinnings(uint256 round, uint256 winningNumber) private {
        address[] memory participants = roundParticipants[round];
        uint256 winnerCount = 0;
        uint256 totalBet = address(this).balance;

        // Calculate winners and distribute winnings
        for (uint i = 0; i < participants.length; i++) {
            if (playerBets[round][participants[i]] == winningNumber) {
                winnerCount++;
            }
        }

        if (winnerCount > 0) {
            uint256 winningAmount = totalBet / winnerCount;
            for (uint i = 0; i < participants.length; i++) {
                if (playerBets[round][participants[i]] == winningNumber) {
                    payable(participants[i]).transfer(winningAmount);
                }
            }
        }

        // Reset for the next round, if necessary
    }

    // Additional functions as needed
}

