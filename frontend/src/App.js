import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.js'; 
import HomePage from './pages/HomePage.js'; 
import GamePage from './pages/GamePage.js';
import ProtectedRoute from './components/ProtectedRoute.js'; // Import ProtectedRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/home" element={<HomePage />} />

      </Routes>
    </Router>
  );
}

export default App;
