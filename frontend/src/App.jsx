// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import KitCreationPage from './components/KitCreation';
import KitListPage from './components/KitList';
import KitEditPage from './components/KitEdit';
import api from './api';
import './styles/Global.css';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user data from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          // Verify stored user is still valid with backend
          const response = await api.get('/auth/profile/');
          const user = response.data;
          setUserData(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('user');
          setUserData(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLoginSuccess = (userRole) => {
    const user = { role: userRole };
    setUserData(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Header userData={userData} onUserChange={handleLogout} />
        
        <div className="app-content">
          <Routes>
            <Route 
              path="/" 
              element={userData ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={<Register />} 
            />
            <Route 
              path="/dashboard" 
              element={userData?.role === 'doctor' ? <KitCreationPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/kits" 
              element={userData?.role === 'doctor' ? <KitListPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/kits/create" 
              element={userData?.role === 'doctor' ? <KitCreationPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/kits/:id/edit" 
              element={userData?.role === 'doctor' ? <KitEditPage /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;