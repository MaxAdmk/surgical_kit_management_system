// src/App.jsx
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import './styles/Global.css';

function App() {
  const [currentView, setCurrentView] = useState('login');

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  return (
    <div className="app-container">
      <Header />
      
      <div className="app-content">
        {currentView === 'login' ? (
          <Login onSwitchToRegister={handleSwitchToRegister} />
        ) : (
          <Register onSwitchToLogin={handleSwitchToLogin} />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;