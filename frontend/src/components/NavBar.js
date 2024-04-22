import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavLogo from '../images/Group 2.png'; // Adjust the path as necessary
import Modal from './Modal';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const isActive = (path) => location.pathname === path;

  
  const handleLogout = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      // Perform logout logic here
      localStorage.removeItem('isConnected'); // Clear connection flag
      navigate('/'); // Navigate back to the LoginPage
    } else {
      setModalMessage("Please disconnect from Sepolia Roulette within your wallet before exiting the game.");
      setShowModal(true);
    }
  };

  const handleAbout = () => {
    navigate('/about');
  }
  const handleGame = () => navigate('/game');

  const handleLeaderboard = () => navigate('/leaderboard');

  return (
    <nav className="flex justify-between items-center w-full p-2 bg-white shadow-md">
      <div className="flex items-center mb-3 mx-3">
        <img src={NavLogo} alt="Logo" className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 my-2 mx-3" />
        <button className={`py-2 px-4 mx-2 text-black ${isActive('/game') ? 'font-bold' : ''} text-black bg-transparent hover:bg-gray-100 rounded text-md mb-1`}  onClick={handleGame}>Game</button>
        <button className={`py-2 px-4 mx-2 text-black ${isActive('/about') ? 'font-bold' : ''} text-black bg-transparent hover:bg-gray-100 rounded text-md mb-1`} onClick={handleAbout}>About</button>
        <button className={`py-2 px-4 mx-2 text-black ${isActive('/leaderboard') ? 'font-bold' : ''} text-black bg-transparent hover:bg-gray-100 rounded text-md mb-1`}  onClick={handleLeaderboard}>Leaderboard</button>
        <button className="py-2 px-4 mx-2 text-black bg-transparent hover:bg-gray-100 rounded text-md mb-1" onClick={handleLogout}>Sign out</button>
      </div>
      {showModal && (
      <Modal 
        message={modalMessage} 
        type="info" // Assuming you have an 'info' type or similar for general messages
        onClose={() => setShowModal(false)}
      />
    )}
    </nav>
    
    
    
  );
};

export default NavBar;