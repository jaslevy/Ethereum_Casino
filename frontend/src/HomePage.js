import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  let navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here
    localStorage.removeItem('isConnected'); // Clear connection flag
    navigate('/'); // Navigate back to the LoginPage
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default HomePage;