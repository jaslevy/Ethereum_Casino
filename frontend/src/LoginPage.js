import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import Logo from './images/Group 1.png'


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
          // If an account is connected, navigate to the HomePage
          navigate('/home');
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
      navigate('/home');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white-100 mt-20">
      <img src={Logo} alt="Group 1" className="w-2/3 md:w-1/2 lg:w-1/3 mt-8 mb-4"  /> {/* Adjust margin-top and max-width */}
      <button 
        onClick={connectWallet} 
        className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-blue-500 mt-8 hover:bg-blue-400 text-white font-bold border-b-4 border-blue-700 hover:border-blue-500 rounded"
      >
        Connect to MetaMask Wallet
      </button>
    </div>
  );
}

export default LoginPage;