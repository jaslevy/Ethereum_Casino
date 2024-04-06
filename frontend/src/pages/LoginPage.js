import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import Logo from '../images/Group 1.png';
import MetaMaskIcon from '../images/metamask-icon.svg'; // Moved here

function LoginPage() {
  let navigate = useNavigate();
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        // Initialize web3 instance
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Check if any accounts are already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          // If an account is connected, navigate to the GamePage
          navigate('/game');
        }
      } else {
        alert("MetaMask is not installed. Please consider installing it.");
      }
    };

    checkIfWalletIsConnected();
  }, [navigate]);

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      localStorage.setItem('isConnected', 'true'); // Store connection flag
      navigate('/game');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white-100 mt-60">
      <img src={Logo} alt="Group 1" className="w-2/3 md:w-1/2 lg:w-1/3 mt-8 mb-10"  />
      <button onClick={connectWallet} type="button" class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2">
      <img src={MetaMaskIcon} alt="MetaMask" className="mr-3" width="16" height="16" />
        Connect with MetaMask
      </button>
    </div>
  );
}

export default LoginPage;