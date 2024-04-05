import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../images/Group 1.png'

function GamePage() {

  let navigate = useNavigate();

  const [selectedButton, setSelectedButton] = useState(null);


  const handleLogout = () => {
    // Perform logout logic here
    localStorage.removeItem('isConnected'); // Clear connection flag
    navigate('/'); // Navigate back to the LoginPage
  };

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
  


  return (
    
    <div className="flex flex-col items-center min-h-screen bg-white-100 mt-20">
      <img src={Logo} alt="Group 1" className="w-2/3 md:w-1/2 lg:w-1/3 mt-8 mb-4"  /> {/* Adjust margin-top and max-width */}
        {/* Current Game Data Section */}
            <div className="mb-8">
                <h2>Current Game Data</h2>
                {/* Display current game data here */}
            </div>
        {/* Additional Selectable Buttons */}
        <div className="flex justify-center gap-2 mb-4 mt-5">
            <button
            className={`btn shadow-lg font-bold text-white bg-green-500 rounded-2xl w-20 h-12 ${selectedButton === 'extra-1' ? 'ring-4 bg-black ring-cyan-500/50' : ''}`}
            onClick={() => toggleButton('extra-1')}
            >
            0
            </button>
            <button
            className={`btn shadow-lg font-bold text-white bg-green-500 rounded-2xl w-20 h-12 ${selectedButton === 'extra-2' ? 'ring-4 bg-black ring-cyan-500/50' : ''}`}
            onClick={() => toggleButton('extra-2')}
            >
            00
            </button>
        </div>
        {/* Numbered Buttons Table */}
          <div className="grid grid-cols-12 gap-2 mb-8">
        {orderedNumbers.map((number) => (
          <button
            key={number}
            style={selectedButton === number ? { borderColor: 'cyan', borderWidth: '4px' } : {}}
            className={`btn font-bold text-white border-x-4 border-y-4 ${number % 2 === 0 ? 'bg-black' : 'bg-red-500'} w-full h-full `}
            onClick={() => toggleOneButton(number)}
          >
            {number}
          </button>
        ))}
      </div>
      {/* Betting Table */}
      <div className="w-full max-w-2xl px-8 py-4 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-4">
          <input type="number" placeholder="Bet Amount" className="input input-bordered w-full max-w-xs mr-4 rounded-full text-lg" />
          {['1st 12', '2nd 12', '3rd 12'].map((id) => (
            <button key={id} className={`btn font-bold text-lg text-white ${isButtonSelected(id) ? 'bg-purple-700' : 'bg-purple-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`} onClick={() => toggleButton(id)}>
              {id}
            </button>
          ))}
        </div>
        <div className="flex justify-between mb-4">
          {['1 to 18', '19 to 36'].map((id) => (
            <button key={id} className={`btn font-bold text-lg text-white ${isButtonSelected(id) ? 'bg-purple-800' : 'bg-purple-600'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`} onClick={() => toggleButton(id)}>
              {id}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <button key="Even" className={`btn font-bold text-lg text-white ${isButtonSelected('Even') ? 'bg-black' : 'bg-gray-600'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`} onClick={() => toggleButton('Even')}>
            Even
          </button>
          <button key="Odd" className={`btn font-bold text-lg text-white ${isButtonSelected('Odd') ? 'bg-red-700' : 'bg-red-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`} onClick={() => toggleButton('Odd')}>
            Odd
          </button>
          <button key="Red" className={`btn font-bold text-lg text-white ${isButtonSelected('Red') ? 'bg-red-700' : 'bg-red-500'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`} onClick={() => toggleButton('Red')}>
            Red
          </button>
          <button key="Black" className={`btn font-bold text-lg text-white ${isButtonSelected('Black') ? 'bg-black' : 'bg-gray-600'} flex-1 mx-2 rounded-full shadow-lg transform hover:translate-y-1 transition-transform duration-150 ease-in-out`} onClick={() => toggleButton('Black')}>
            Black
          </button>
        </div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>

  );
}

export default GamePage;