import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isConnected = localStorage.getItem('isConnected') === 'true';
  return isConnected ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;