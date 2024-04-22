// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DecentralizedCasino {

    address public owner;

    uint256 public constant STAKE_VALUE = 0.0001 ether;
    uint8 public constant MAX_NUMBER = 48;

    // These need to be private so that other bettors can't see what others are doing
    mapping(uint8 => address payable[]) private betMap;
    mapping(address => uint8[]) private addressMap;
    address[] private addressesStakedInRound;
    int256[] private earnings;
    mapping(address => uint256) private addressesToEarningsMap;

    bool public gameOngoing = false;
    uint256 public currentGameId;
    uint256 public currentGameUnlockTime;
    uint256 public currentBetCount;

    event RugPulled(uint256 amount);
    event GameStarted(uint256 indexed gameId, uint256 unlockTime);
    event GameEnded(uint256 indexed gameId, uint8 gameWinningValue, address[] addressesWhoWon, int256[] correspondingEarnings);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    function placeBet(uint8[] memory choices) external payable {
        require(gameOngoing, "Game is not currently ongoing");
        require(msg.value == STAKE_VALUE * choices.length, "Send the correct stake amount");

        if (addressesToEarningsMap[msg.sender] == 0) {
            addressesStakedInRound.push(msg.sender);
            addressesToEarningsMap[msg.sender] = earnings.length + 1;
            earnings.push(-1 * int256(msg.value));
        } else {
            earnings[addressesToEarningsMap[msg.sender] - 1] -= int256(msg.value);
        }

        for (uint i = 0; i < choices.length; i++) {
            uint8 choice = choices[i];
            betMap[choice].push(payable(msg.sender));
            addressMap[msg.sender].push(choice);    
        }
        currentBetCount += choices.length;
    }

    function startGame(uint256 unlockTime) external onlyOwner {
        require(!gameOngoing, "Another game is ongoing currently");

        gameOngoing = true;
        currentGameUnlockTime = unlockTime;
        currentGameId++;
        emit GameStarted(currentGameId, unlockTime);
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

    function _generateRandomNumber() internal view returns (uint8) {
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp)));
        return uint8(randomHash % 36 + 1);
    }

    function _clearVariablesAtEndOfRound() internal {
        // Clear the mapping of addresses involved in the current round
        for (uint i = 0; i < addressesStakedInRound.length; i++) {
            delete addressMap[addressesStakedInRound[i]];
            delete addressesToEarningsMap[addressesStakedInRound[i]];
        }
        delete addressesStakedInRound;
        delete earnings;

        // Clear the bet mapping involved in the current round
        for (uint8 i = 0; i <= MAX_NUMBER; i++) {
            delete betMap[i];
        }

        currentBetCount = 0;
        gameOngoing = false;
    }

    function endGame() external onlyOwner {
        require(gameOngoing, "No game is underway");
        uint8 gameWinningValue = _generateRandomNumber() ; // placeholder for now
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
                uint256 payout = addressMap[addressesStakedInRound[i]].length * STAKE_VALUE;
                payable(addressesStakedInRound[i]).transfer(payout);
                earnings[i] = 0;
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
                } else {
                    // Correct 1/2-interval, even/odd, or red/black
                    payoutVal = unit;
                }

                for (uint256 j = 0; j < betMap[betToCheck].length; j++) {
                    address winner = betMap[betToCheck][j];
                    require(addressesToEarningsMap[winner] >= 1, "addressesToEarningsMap[winner] is 0");
                    earnings[addressesToEarningsMap[winner] - 1] += int256(payoutVal);
                    payable(winner).transfer(payoutVal);
                }
            }
        }

        emit GameEnded(currentGameId, gameWinningValue, addressesStakedInRound, earnings);

        _clearVariablesAtEndOfRound();
    }

    function withdrawStake() external returns (uint256) {
        // It is OK for this to cost a lot of gas since it should not be triggered if server behaves honestly
        require(block.timestamp > currentGameUnlockTime, "Too early to withdraw stake");
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
                    break;
                } else {
                    j++;
                }
            }
        }

        currentBetCount -= addressMap[msg.sender].length;
        delete addressMap[msg.sender];

        require(addressesToEarningsMap[msg.sender] >= 1, "issue with address to earnings map");
        addressesStakedInRound[addressesToEarningsMap[msg.sender] - 1] = addressesStakedInRound[addressesStakedInRound.length - 1];
        addressesStakedInRound.pop();
        require(earnings.length >= 1, "issue with earnings length");
        earnings[addressesToEarningsMap[msg.sender] - 1] = earnings[earnings.length - 1];
        earnings.pop();
        delete addressesToEarningsMap[msg.sender];

        payable(msg.sender).transfer(withdrawAmount);
        return withdrawAmount;
    }

    function definitelyNotARugPull() external onlyOwner returns (uint256) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No Ether available to transfer");
        payable(owner).transfer(balance);
        emit RugPulled(balance); 
        _clearVariablesAtEndOfRound();
        return balance;
    }
}