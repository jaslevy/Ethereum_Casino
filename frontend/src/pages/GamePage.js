import { React, useState, useEffect, useMemo } from 'react';
import Logo from '../images/Group 1.png';
import NavBar from '../components/NavBar';
import './styles/GamePage.css';
import { ethers } from 'ethers';
import LoadingIcons from 'react-loading-icons';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';


function GamePage() {


  // const supabaseUrl = 'YOUR_SUPABASE_URL';
  // const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
  // const supabase = createClient(supabaseUrl, supabaseKey);

  const [selectedButtons, setSelectedButtons] = useState([]);
  const [betUnit, setBetUnit] = useState();

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [promisedEndTime, setPromisedEndTime] = useState('');
  const [currentGameId, setCurrentGameId] = useState('');
  const [totalBets, setTotalBets] = useState();

  const contractAddress = "0xDF7BBe93E454eB9AaC31310fCD4b387ec539C374";
  const contractABI = useMemo(() => [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"gameId","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"gameWinningValue","type":"uint8"},{"indexed":false,"internalType":"address[]","name":"addressesWhoWon","type":"address[]"},{"indexed":false,"internalType":"int256[]","name":"correspondingEarnings","type":"int256[]"}],"name":"GameEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"gameId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"unlockTime","type":"uint256"}],"name":"GameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RugPulled","type":"event"},{"inputs":[],"name":"BEN_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_NUMBER","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"STAKE_VALUE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentBetCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentGameId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentGameUnlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"definitelyNotARugPull","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"endGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"gameOngoing","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8[]","name":"choices","type":"uint8[]"}],"name":"placeBet","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"unlockTime","type":"uint256"}],"name":"startGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}], []);
// eslint-disable-next-line no-unused-vars
  const triggerFireworks = () => {
    var end = Date.now() + (5 * 1000);
  
    // Go for 15 seconds
    var interval = setInterval(function() {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
  
      // Call confetti with various options
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        shapes: ['square', 'circle'],
        origin: {
          x: Math.random(),
          // since they fall down, start a bit higher than random
          y: Math.random() - 0.2
        }
      });
    }, 200); // Launch every 200 milliseconds
  };

  const checkEarnings = async (value, addresses, earnings, signer) => {
    const userAddress = await signer.getAddress();
    const index = addresses.findIndex(address => address === userAddress);
    const earningsVal = ethers.utils.formatEther(ethers.BigNumber.from(earnings[index]).toNumber());
    if (index !== -1 && earnings[index].gt(0)) { // Using BigNumber comparison
      // User has positive earnings
      setModalMessage("Congratulations! The winning number was " + value + "! Your net winnings for this game are " + earningsVal + " ETH!");
      setModalType('gold'); 
      triggerFireworks();
    } else if (index !== -1 && earnings[index].eq(0)) {
      setModalMessage("The winning number was " + value + ". You did not win or lose any ETH in this game.");
      setModalType('info'); 
    } else if (index !== -1 && earnings[index].lt(0)) {
      setModalType('info'); 
      setModalMessage("The winning number was " + value + ". You lost " + earningsVal + " ETH in this game.");
    } else {
      setModalMessage("The winning number of this round was " + value + ". You did not bet in this round.");
      setModalType('info'); 
    }
    setShowModal(true);
  };

  const getCurrentGameInfo = async(contract) => {
    try {
      const gameOngoing = await contract.gameOngoing();
      setBetUnit(ethers.utils.formatEther(await contract.STAKE_VALUE()));
      if (gameOngoing) {
        let gameId = await contract.currentGameId();
        setCurrentGameId(ethers.BigNumber.from(gameId).toNumber());
        let promisedDate = new Date(await contract.currentGameUnlockTime() * 1000).toLocaleString();
        setPromisedEndTime(promisedDate.toLocaleString('en-US', { timeZone: 'America/New_York' }) + " EST");
        let totalBets = await contract.currentBetCount();
        setTotalBets(ethers.BigNumber.from(totalBets).toNumber());
      } else {
        setCurrentGameId("No round open");
        setPromisedEndTime("");
        setTotalBets("");
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };



  useEffect(() => {
    let contract;
    const setupEventListener = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
  
        contract.on("GameEnded", (id, gameWinningValue, addressesWhoWon, correspondingEarnings) => {
          console.log("Game ended");
          console.log(addressesWhoWon);
          for (let i = 0; i < addressesWhoWon.length; i++) {
            console.log(addressesWhoWon[i]);
          }
          for (let i = 0; i < correspondingEarnings.length; i++) {
            console.log(correspondingEarnings[i]);
          }
          setPromisedEndTime("");
          setCurrentGameId("No game open");
          setTotalBets("");
          checkEarnings(gameWinningValue, addressesWhoWon, correspondingEarnings, signer);
        });

        contract.on("GameStarted", (id, timestamp) => {
          console.log("Game started")
          getCurrentGameInfo(contract);
        });

        contract.on("RugPulled", (amount) => {
           console.log(amount);
           setModalMessage("You have been fooled. The owner of the smart contract took all of the bets for himself!");
           setModalType('haha'); // Use 'info' or another suitable identifier for this case
           setShowModal(true);
           getCurrentGameInfo(contract);
        });
      }
    };
  
    setupEventListener();

    if (contract) {
      getCurrentGameInfo(contract);
    }
  
    // Cleanup function to remove listener when component unmounts
    return () => {
      if (contract) {
        contract.removeAllListeners("GameEnded");
      }
    };
  }, [contractAddress, contractABI]); 

  const withdrawBets = async () => {
    console.log("Withdrawing bets")

    if (!window.ethereum) {
      alert("Please install MetaMask to proceed.");
      return;
    }
    setIsLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // Since STAKE_VALUE is 3600 wei, use it directly without conversion
      const transactionResponse = await contract.withdrawStake();
      await transactionResponse.wait(); // Wait for the transaction to be mined
      console.log(transactionResponse.toString());

      setIsLoading(false); // End loading
      setModalMessage('Bets withdrawn successfully!');
      setModalType('success');
      setShowModal(true);
      getCurrentGameInfo(contract);
    } catch (error) {
      setIsLoading(false); // End loading
      if (error.message.includes("No bets placed")) {
        setModalMessage('No bets to withdraw.');
        setModalType('info');
        setShowModal(true);
      } else if (error.message.includes("Too early to withdraw stake")) {
        setModalMessage('Too early to withdraw bets.');
        setModalType('info');
        setShowModal(true);
      } else {
        console.error("Error withdrawing bets:", error);
        setModalMessage('Error Withdrawing Bets');
        setModalType('error');
        setShowModal(true);
      }
    }
  }
  

  const submitBet = async () => {
    console.log("Submitting bets")
    console.log(selectedButtons)
    // if length of selectedButtons
    if (selectedButtons.length === 0) {
      setModalMessage("Please select a bet.");
      setModalType('info'); // Use 'info' or another suitable identifier for this case
      setShowModal(true);
      // triggerFireworks(); FOR TESTING
      return;
    }
  
    if (!window.ethereum) {
      alert("Please install MetaMask to proceed.");
      return;
    }
    setIsLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // Since STAKE_VALUE is 3600 wei, use it directly without conversion
      const passInArray = selectedButtons;
      const transactionResponse = await contract.placeBet(passInArray, { value: ethers.utils.parseEther(betUnit.toString()) * passInArray.length});
      await transactionResponse.wait(); // Wait for the transaction to be mined

      setIsLoading(false); // End loading
      setModalMessage('Bet placed successfully!');
      setModalType('success');
      setShowModal(true);
      setSelectedButtons([]);
      getCurrentGameInfo(contract);
    } catch (error) {
      setIsLoading(false); // End loading
      console.error("Error submitting bet:", error);
      if (error.message.includes("Game is not currently ongoing")) {
        setModalMessage('Cannot submit bet because there is not an open betting round.');
      } else if (error.message.includes("user rejected transaction")) {
        setModalMessage('User rejected transaction.');
      } else {
        setModalMessage('Error Submitting Bet');
      }
      setModalType('error');
      setShowModal(true);
    }
  };


  const generateOrderedNumbers = () => {
    let numbers = Array.from({ length: 36 }, (_, i) => i + 1);
    let orderedNumbers = new Array(36);
    numbers.forEach((number, index) => {
      // Calculate the new position based on the specified order
      let row = index % 3;
      let col = Math.floor(index / 3);
      let newPosition = (2 - row) * 12 + col;
      orderedNumbers[newPosition] = number;
    });
    return orderedNumbers;
  };

  const orderedNumbers = generateOrderedNumbers();
  // const toggleOneButton = (buttonId) => {
  //   setSelectedButton(prev => prev === buttonId ? null : buttonId);
  // };

  const myMapping = {
    'Top Row': 46,
    'Middle Row': 47,
    'Bottom Row': 48,
    '1st 12': 37,
    '2nd 12': 38,
    '3rd 12': 39,
    '1 to 18': 40,
    '19 to 36': 41,
    'Even': 42,
    'Odd': 43,
    'Red': 44,
    'Black': 45
  };

  const toggleButton = (buttonId) => {
    if (buttonId in myMapping) {
      buttonId = myMapping[buttonId];
    }
    setSelectedButtons(prev => 
      prev.includes(buttonId) ? prev.filter(id => id !== buttonId) : [...prev, buttonId]
    );
  };

  const isButtonSelected = (buttonId) => {
    if (buttonId in myMapping) {
      buttonId = myMapping[buttonId];
    }
    return selectedButtons.includes(buttonId);
  }

  return (
    
    <div className={`flex flex-col items-center min-h-screen bg-white-100 mt-3 ${isLoading ? 'blur-sm' : ''}`}>
      <NavBar />
      <img src={Logo} alt="Group 1" className="w-2/3 md:w-1/2 lg:w-1/3 mt-16 mb-4"  /> {/* Adjust margin-top and max-width */}
      {/* Current Game Data Section */}
      <div className="mb-2">
      <div className="text-center font-bold">
        <span className="text-black">Bet unit:</span> <span className="text-blue-500">{betUnit} SepoliaETH</span>
      </div>
        <div className="overflow-x-auto mt-5">
          <table className="table-auto w-full text-center whitespace-no-wrap mb-4">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
                <th className="px-4 py-3">Current Game Number</th>
                <th className="px-4 py-3">Promised End Time</th>
                <th className="px-4 py-3">Bets Staked</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">{currentGameId}</td>
                <td className="px-4 py-3 border text-blue-500 hover:text-blue-600" >
                  {promisedEndTime} {/* Fake wallet address */}
                </td>
                <td className="px-4 py-3 border" >
                  {totalBets}
                </td>
              </tr>
              {/* Additional rows as needed */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Numbered Buttons Table */}
      <div className="grid grid-cols-12 gap-2 mb-8">
      {orderedNumbers.map((number) => {
        // Define the numbers that should be red
        const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        // Determine button color
        let buttonColorClass = 'bg-black'; // Default color
        if (redNumbers.includes(number)) {
          buttonColorClass = 'bg-red-500'; // Red for specified numbers
        } else if (number === 0 || number === '00') { // Assuming '00' is treated as a special case and included in orderedNumbers
          buttonColorClass = 'bg-green-500'; // Green for 0 and 00
        }
        return (
          <button
            key={number}
            style={isButtonSelected(number) ? { borderColor: 'cyan', borderWidth: '4px' } : {}}
            className={`btn font-bold text-white border-x-4 border-y-4 ${buttonColorClass} w-full h-full`}
            onClick={() => toggleButton(number)}
          >
            {number}
          </button>
        );
      })}
    </div>
    {/* Betting Table */}
    <div className="w-full max-w-2xl px-8 py-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between mb-4">
        {['Top Row', 'Middle Row', 'Bottom Row'].map((row) => (
          <button
            key={row}
            className={`btn font-bold text-lg text-white ${isButtonSelected(row) ? 'bg-purple-700' : 'bg-purple-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
            onClick={() => toggleButton(row)}
          >
            {row}
          </button>
        ))}
      </div>
      <div className="flex justify-between mb-4">
        {['1st 12', '2nd 12', '3rd 12'].map((id) => (
          <button
            key={id}
            className={`btn font-bold text-lg text-white ${isButtonSelected(id) ? 'bg-purple-700' : 'bg-purple-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
            onClick={() => toggleButton(id)}
          >
            {id}
          </button>
        ))}
      </div>
      <div className="flex justify-between mb-4">
        {['1 to 18', '19 to 36'].map((id) => (
          <button
            key={id}
            className={`btn font-bold text-lg text-white ${isButtonSelected(id) ? 'bg-purple-800' : 'bg-purple-600'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
            onClick={() => toggleButton(id)}
          >
            {id}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          key="Even"
          className={`btn font-bold text-lg text-white ${isButtonSelected('Even') ? 'bg-black' : 'bg-gray-600'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
          onClick={() => toggleButton('Even')}
        >
          Even
        </button>
        <button
          key="Odd"
          className={`btn font-bold text-lg text-white ${isButtonSelected('Odd') ? 'bg-red-700' : 'bg-red-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
          onClick={() => toggleButton('Odd')}
        >
          Odd
        </button>
        <button
          key="Red"
          className={`btn font-bold text-lg text-white ${isButtonSelected('Red') ? 'bg-red-700' : 'bg-red-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
          onClick={() => toggleButton('Red')}
        >
          Red
        </button>
        <button
          key="Black"
          className={`btn font-bold text-lg text-white ${isButtonSelected('Black') ? 'bg-black' : 'bg-gray-600'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`}
          onClick={() => toggleButton('Black')}
        >
          Black
        </button>
      </div>
    </div>
    <div className="flex justify-center items-center space-x-6 mb-8 mt-8">
      <button
        className="submit-button"
        onClick={submitBet}
      >
        Submit Bet
      </button>
      <button
        className="submit-button"
        onClick={withdrawBets}
      >
        Withdraw Bets
      </button>
    </div>
  {isLoading && (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        {/* This overlay and the LoadingIcons.Bars will not be blurred */}
        <LoadingIcons.Circles className="text-white" />
      </div>
    )}
  {showModal && <Modal 
          message={modalMessage} 
          type={modalType} 
          onClose={() => setShowModal(false)} 
        />}
  </div>
  

);
}

export default GamePage;
