import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';

function HomePage() {
    const data = Array.from({ length: 38 }, (_, i) => ({ option: `${i}` }));
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);

    const handleSpinClick = () => {
        if (!mustSpin) {
        const newPrizeNumber = Math.floor(Math.random() * data.length);
        setPrizeNumber(newPrizeNumber);
        setMustSpin(true);
        }
    }
  let navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here
    localStorage.removeItem('isConnected'); // Clear connection flag
    navigate('/'); // Navigate back to the LoginPage
  };

  return (
    
    <div>
        
      <h1>Home Page</h1>
      <>
        <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}

            onStopSpinning={() => {
            setMustSpin(false);
            }}
        />
        <button onClick={handleSpinClick}>SPIN</button>
    </>
      <p>Welcome to the home page!</p>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default HomePage;