import React, { useEffect } from 'react';
import '../styles/Header.css';
import api from '../api';

const Header = ({ userData, onUserChange }) => {
  // userData is passed from App.jsx, so Header always has the latest user state

  useEffect(() => {
    // Only verify session periodically if user is logged in
    if (userData) {
      const interval = setInterval(async () => {
        try {
          const response = await api.get('/auth/profile/');
          // Session is valid, user data is up to date from App.jsx
        } catch (error) {
          console.error("Session check failed:", error);
          // If session is invalid, logout
          if (onUserChange) {
            onUserChange();
          }
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [userData, onUserChange]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await api.post('/auth/logout/', {});
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        if (onUserChange) {
          onUserChange();
        }
        window.location.href = '/';
      }
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="url(#gradient)" />
              <path d="M20 12V28M12 20H28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="company-info">
            <h1 className="company-name">SurgiKit</h1>
            <p className="company-tagline">Medical equipment management system</p>
          </div>
        </div>

        <nav className="nav-links">
          {userData ? (
            <>
              <div className="user-info">
                <span className="user-role">
                  {userData.role === 'doctor' ? '👨‍⚕️ Doctor' : '📊 Administrator'}
                </span>
              </div>
              
              {userData.role === 'doctor' && (
                <a href="/kits" className="nav-link kits-link">
                  📦 Kits List
                </a>
              )}
              
              <a href="#about" className="nav-link">About System</a>
              <a href="#contact" className="nav-link">Contacts</a>
              
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="#about" className="nav-link">About System</a>
              <a href="#contact" className="nav-link">Contacts</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
