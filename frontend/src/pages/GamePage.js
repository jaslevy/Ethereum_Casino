import { React, useState, useEffect } from 'react';
import Logo from '../images/Group 1.png';
import NavBar from '../components/NavBar';
import './styles/GamePage.css';
import io from 'socket.io-client';
import { createClient } from '@supabase/supabase-js';

function GamePage() {


  // const supabaseUrl = 'YOUR_SUPABASE_URL';
  // const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
  // const supabase = createClient(supabaseUrl, supabaseKey);

  const [selectedButton, setSelectedButton] = useState(null);
  const [selectedButtons, setSelectedButtons] = useState([]);
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
  const toggleOneButton = (buttonId) => {
    setSelectedButton(prev => prev === buttonId ? null : buttonId);
  };

  const toggleButton = (buttonId) => {
    setSelectedButtons(prev => 
      prev.includes(buttonId) ? prev.filter(id => id !== buttonId) : [...prev, buttonId]
    );
  };

  const isButtonSelected = (buttonId) => selectedButtons.includes(buttonId);
  
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    const socket = io('http://localhost:3000'); // Use your backend server URL here
    socket.on('welcome', (message) => {
      console.log(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) return prevCountdown - 1;
        return 120; // Reset to 2 minutes after reaching 0
      });
    }, 1000); // Update every second

    // Pause for 5 seconds at 0 before resetting
    if (countdown === 0) {
      clearInterval(interval); // Stop the countdown
      setTimeout(() => {
        setCountdown(120); // Reset to 2 minutes after a 5-second pause
      }, 5000); // 5-second pause
    }

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [countdown]);

  return (
    
    <div className="flex flex-col items-center min-h-screen bg-white-100 mt-3">
      <NavBar />
      <img src={Logo} alt="Group 1" className="w-2/3 md:w-1/2 lg:w-1/3 mt-20 mb-4"  /> {/* Adjust margin-top and max-width */}
      {/* Current Game Data Section */}
      <div className="mb-2">
        <div className="overflow-x-auto mt-5">
          <table className="table-auto w-full text-center whitespace-no-wrap">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
                <th className="px-4 py-3">Current Game Number</th>
                <th className="px-4 py-3">Previous Game Winner(s)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              <tr className="text-gray-700">
                <td className="px-4 py-3 border">123</td>
                <td className="px-4 py-3 border text-blue-500 hover:text-blue-600">
                  0xd8...b3f9 {/* Fake wallet address */}
                </td>
              </tr>
              {/* Additional rows as needed */}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* Additional Selectable Buttons */}
      <div className="flex justify-center gap-2 mb-4 mt-5">
          <button
          className={`btn shadow-lg font-bold text-white bg-green-500 rounded-2xl w-20 h-12 ${selectedButton === 'extra-1' ? 'ring-4 ring-cyan-200/100' : ''}`}
          onClick={() => toggleOneButton('extra-1')}
          >
          0
          </button>
          <button
          className={`btn shadow-lg font-bold text-white bg-green-500 rounded-2xl w-20 h-12 ${selectedButton === 'extra-2' ? 'ring-4 ring-cyan-200/100' : ''}`}
          onClick={() => toggleOneButton('extra-2')}
          >
          00
          </button>
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
            style={selectedButton === number ? { borderColor: 'cyan', borderWidth: '4px' } : {}}
            className={`btn font-bold text-white border-x-4 border-y-4 ${buttonColorClass} w-full h-full`}
            onClick={() => toggleOneButton(number)}
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
    <div className="text-center mb-8 mt-8">
      <button
        className="submit-button"
        onClick={() => {/* Handle submit bet logic here */}}
      >
        Submit Bet
      </button>
  </div>
    
  </div>
  

);
}

export default GamePage;
