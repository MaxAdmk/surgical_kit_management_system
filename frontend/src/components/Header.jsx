import React from 'react';
import '../styles/Header.css';

const Header = () => {
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
            <p className="company-tagline">Система управління медичним спорядженням</p>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#about" className="nav-link">Про систему</a>
          <a href="#contact" className="nav-link">Контакти</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
