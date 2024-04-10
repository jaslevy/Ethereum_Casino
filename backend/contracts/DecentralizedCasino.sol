// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DecentralizedCasino {

    address public owner;

    uint256 public constant STAKE_VALUE = 1;
    uint8 public constant MAX_NUMBER = 48;

    // These need to be private so that other bettors can't see what others are doing
    mapping(uint8 => address payable[]) private betMap;
    mapping(address => uint8[]) private addressMap;
    address payable[] private addressesStakedInRound;

    bool public gameOngoing = false;
    uint256 public currentGameId;
    uint256 public currentGameUnlockTime;

    event GameStarted(uint256 indexed gameId, uint256 unlockTime);
    event GameEnded(uint256 indexed gameId, uint8 number, uint256 endTime); // Do we want to include payout and bet information?

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    function placeBet(uint8 choice) external payable {
        require(gameOngoing, "Game is not currently ongoing");
        require(msg.value == STAKE_VALUE, "Send the correct stake amount");

        betMap[choice].push(payable(msg.sender));
        addressMap[msg.sender].push(choice);
        addressesStakedInRound.push(payable(msg.sender));
    }

    function startGame(uint256 unlockTime) external onlyOwner {
        require(!gameOngoing, "Another game is ongoing currently");

        gameOngoing = true;
        currentGameUnlockTime = unlockTime;
        currentGameId++;
        emit GameStarted(unlockTime, currentGameId);
    }

    function getNumberCorrespondence(uint8 gameWinningValue, uint8 i) private pure returns (uint8) {
        uint8 numberCorrespondence = gameWinningValue;
        if (i == 1) {
            if (gameWinningValue <= 12) {
                numberCorrespondence = 37;
            } else if (gameWinningValue <= 24) {
                numberCorrespondence = 38;
            } else {
                numberCorrespondence = 39;
            }
        } else if (i == 2) {
            if (gameWinningValue <= 18) {
                numberCorrespondence = 40;
            } else {
                numberCorrespondence = 41;
            }
        } else if (i == 3) {
            if (gameWinningValue % 2 == 0) {
                numberCorrespondence = 42;
            } else {
                numberCorrespondence = 43;
            }
        } else if (i == 4) {
            if (gameWinningValue % 2 == 0 && ((gameWinningValue >= 20 && gameWinningValue <= 28) || gameWinningValue <= 10)) {
                // Black even
                numberCorrespondence = 45;
            } else if (gameWinningValue % 2 == 1 && ((gameWinningValue >= 11 && gameWinningValue <= 17) || gameWinningValue >= 29)) {
                // Black odd
                numberCorrespondence = 45;
            } else {
                // Red
                numberCorrespondence = 44;
            }
        } else if (i == 5) {
            if (gameWinningValue % 3 == 0) {
                // Top row
                numberCorrespondence = 46;
            } else if (gameWinningValue % 3 == 1) {
                // Middle row
                numberCorrespondence = 47;
            } else {
                // Bottom row
                numberCorrespondence = 48;
            }
        }
        return numberCorrespondence;
    }

    function endGame() external onlyOwner {
        require(gameOngoing, "No game is underway");
        uint8 gameWinningValue = 36; // placeholder for now
        require(gameWinningValue <= MAX_NUMBER && gameWinningValue >= 1);

        // do we need safe math?
        uint256 v = address(this).balance;        

        uint256 divisor = 0;
        // Set weights for different bet odds, multiply by 2 to avoid working with floats for the 1.5 coefficients
        for (uint8 i = 0; i < 6; i++) {
            uint8 betToCheck = getNumberCorrespondence(gameWinningValue, i);
            uint8 multiplier = 2;
            if (i == 0) {
                multiplier = 36;
            } else if (i == 1 || i == 5) {
                multiplier = 3;
            } 
            divisor += multiplier * betMap[betToCheck].length;
        }

        if (divisor == 0) {
            // Nobody wins
            for (uint256 i = 0; i < addressesStakedInRound.length; i++) {
                payout(addressesStakedInRound[i], STAKE_VALUE);
            }
        } else {
            uint256 unit = 2 * v / divisor;
            for (uint8 i = 0; i < 6; i++) {
                uint8 betToCheck = getNumberCorrespondence(gameWinningValue, i);
                uint256 payoutVal = 0;

                if (i == 0) {
                    // Correct number
                    payoutVal = unit * 18;
                } else if (i == 1 || i == 5) {
                    // Correct 1/3-interval or row
                    payoutVal = 3 * v / divisor;
                } else { //i > 3
                    // Correct 1/2-interval, even/odd, or red/black
                    payoutVal = unit;
                }

                for (uint256 j = 0; j < betMap[betToCheck].length; j++) {
                    payout(betMap[betToCheck][j], payoutVal);
                }
            }
        }

        emit GameEnded(currentGameId, gameWinningValue, block.timestamp);

        // Clear the bet mapping involved in the current round
        for (uint8 i = 0; i < 256; i++) {
            delete betMap[i];
        }

        // Clear the mapping of addresses involved in the current round
        for (uint i = 0; i < addressesStakedInRound.length; i++) {
            delete addressMap[addressesStakedInRound[i]];
        }

        delete addressesStakedInRound;
        gameOngoing = false;
    }

    function payout(address payable receiver, uint256 value) private {
        receiver.transfer(value);
    }

    function withdrawStake() external {
        // It is OK for this to cost a lot of gas since it should not be triggered if server behaves honestly
        require(block.timestamp > currentGameUnlockTime, "Too early to withdraw stake, game hasn't unlocked");
        require(addressMap[msg.sender].length > 0, "No bets placed");

        uint256 withdrawAmount = 0;
        for (uint256 i = 0; i < addressMap[msg.sender].length; i++) {
            // Iterate over all of their bets to calculate how much to reimburse them with, while deleting their bets in the process
            uint8 bet = addressMap[msg.sender][i];
            uint256 j = 0;

            while (j < betMap[bet].length) {
                if (betMap[bet][j] == msg.sender) {
                    // Found one of their bets, remove it
                    betMap[bet][j] = betMap[bet][betMap[bet].length-1];
                    betMap[bet].pop();
                    withdrawAmount += STAKE_VALUE;
                } else {
                    j++;
                }
            }
        }
        
        payable(msg.sender).transfer(withdrawAmount);
    }

    function cancelGame() external onlyOwner {
        // do we need this? to cancel a game midway through
    }
}