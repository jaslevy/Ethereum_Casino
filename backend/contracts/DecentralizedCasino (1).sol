// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./CasinoEntrances.sol";

contract DecentralizedCasino is VRFConsumerBase,CasinoEntrances {
    uint256 public constant ENTRY_FEE = 0.01 ether;
    uint256 public constant NUMBER_RANGE = 36;
    
    address payable[] public numberPlayers;
    mapping(address => uint256) public playernumberGuesses;
    address payable[] public evenOddPlayers;
    mapping(address => string) public evenOddGuesses;
    address payable[] public redBlackPlayers;
    mapping(address => string) public redBlackGuesses;
    address payable[] public oneThirdPlayers;
    mapping(address => string) public oneThirdGuesses;

    uint256 public gameStart;
    uint256 public bettingDuration = 5 minutes;
    bool public gameEnded = false;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    uint256 public previousContractValue; 

    event GameStarted(uint256 duration);
    event PlayerEntered(address player, uint256 guess);
    event StringPlayerEntered(address player, string guess);
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
        previousContractValue = address(this).balance; 
    }

function enternumberGame(uint256 guess) public payable {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(guess >= 1 && guess <= NUMBER_RANGE, "Guess out of range");
        require(block.timestamp <= gameStart + bettingDuration, "Betting period has ended");
        numberPlayers.push(payable(msg.sender));
        playernumberGuesses[msg.sender] = guess;
        emit PlayerEntered(msg.sender, guess);
    }

    function enterEvenOddGame(string memory guess) public payable {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(keccak256(bytes(guess)) == keccak256(bytes('odd')) || keccak256(bytes(guess)) == keccak256(bytes('even')), "Guess not odd or even");
        require(block.timestamp <= gameStart + bettingDuration, "Betting period has ended");
        evenOddPlayers.push(payable(msg.sender));
        evenOddGuesses[msg.sender] = guess;
        emit StringPlayerEntered(msg.sender, guess);
    }

    function enterRedBlackGame(string memory guess) public payable {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
         require(
        keccak256(abi.encodePacked(guess)) == keccak256(abi.encodePacked('red')) || 
        keccak256(abi.encodePacked(guess)) == keccak256(abi.encodePacked('black')),
        "Guess not 'red' or 'black'"
    );
        require(block.timestamp <= gameStart + bettingDuration, "Betting period has ended");
        redBlackPlayers.push(payable(msg.sender));
        redBlackGuesses[msg.sender] = guess;
        emit StringPlayerEntered(msg.sender, guess);
    }

    function enterOneThirdGame(string memory guess) public payable {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(
        keccak256(abi.encodePacked(guess)) == keccak256(abi.encodePacked('first')) || 
        keccak256(abi.encodePacked(guess)) == keccak256(abi.encodePacked('second')) || 
        keccak256(abi.encodePacked(guess)) == keccak256(abi.encodePacked('third')),
        "Guess not 'first', 'second', or 'third'"
    );
        require(block.timestamp <= gameStart + bettingDuration, "Betting period has ended");
        oneThirdPlayers.push(payable(msg.sender));
        oneThirdGuesses[msg.sender] = guess;
        emit StringPlayerEntered(msg.sender, guess);
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
        uint256 numberCount = 0;
        uint256 evenOddCount = 0; 
        uint256 redBlackCount = 0;
        uint256 oneThirdCount = 0;
        string memory evenOddWinner; 
        string memory redBlackWinner;
        string memory oneThirdWinner;
        
        // determine wiining stratgey for the differnet games
        if(randomResult%2 ==1){
            evenOddWinner = 'odd'; 
        }
        else{
            evenOddWinner = 'even';
        }

        if(randomResult<19){
            if(randomResult%2==1){
                redBlackWinner ='red'; 
            }
            else redBlackWinner = 'black';
        }
        else if(randomResult%2==1){
            redBlackWinner = 'black';
        }
        else redBlackWinner ='red';

        if(randomResult<13){
            oneThirdWinner = 'first';
        }
        else if (randomResult>24){
            oneThirdWinner = 'third';
        }
        else oneThirdWinner = 'second';

        // Determine the number of winners
        for (uint256 i = 0; i < numberPlayers.length; i++) {
            if (playernumberGuesses[numberPlayers[i]] == randomResult) {
                numberCount++;
            }
        }

        for (uint256 i = 0; i < evenOddPlayers.length; i++) {
        if (keccak256(bytes(evenOddGuesses[evenOddPlayers[i]])) == keccak256(bytes(evenOddWinner))) {
            evenOddCount++;
        }
    }

    for (uint256 i = 0; i < redBlackPlayers.length; i++) {
        if (keccak256(bytes(redBlackGuesses[redBlackPlayers[i]])) == keccak256(bytes(redBlackWinner))) {
            redBlackCount++;
        }
    }

    for (uint256 i = 0; i < oneThirdPlayers.length; i++) {
        if (keccak256(bytes(oneThirdGuesses[oneThirdPlayers[i]])) == keccak256(bytes(oneThirdWinner))) {
            oneThirdCount++;
        }
    }

        uint256 totalWinners = oneThirdCount + redBlackCount + evenOddCount + numberCount; 
        uint256 unitOfPay = (address(this).balance *2) / (36 *numberCount + 3*oneThirdCount + 2*evenOddCount + 2*redBlackCount);

        // Split the pot between the winners
    if (totalWinners > 0) {
        for (uint256 i = 0; i < numberPlayers.length; i++) {
            if (playernumberGuesses[numberPlayers[i]] == randomResult) {
                payable(numberPlayers[i]).transfer(18 * unitOfPay);
            }
        }

        for (uint256 i = 0; i < evenOddPlayers.length; i++) {
            if (keccak256(bytes(evenOddGuesses[evenOddPlayers[i]])) == keccak256(bytes(evenOddWinner))) {
                payable(evenOddPlayers[i]).transfer(unitOfPay);
            }
        }

        for (uint256 i = 0; i < redBlackPlayers.length; i++) {
            if (keccak256(bytes(redBlackGuesses[redBlackPlayers[i]])) == keccak256(bytes(redBlackWinner))) {
                payable(redBlackPlayers[i]).transfer(unitOfPay);
            }
        }

        for (uint256 i = 0; i < oneThirdPlayers.length; i++) {
            if (keccak256(bytes(oneThirdGuesses[oneThirdPlayers[i]])) == keccak256(bytes(oneThirdWinner))) {
                payable(oneThirdPlayers[i]).transfer((3 * unitOfPay)/2);
            }
        }
    }

        // Reset for the next game
        delete numberPlayers; 
        delete redBlackPlayers; 
        delete oneThirdPlayers;
        delete evenOddPlayers;
    }
}