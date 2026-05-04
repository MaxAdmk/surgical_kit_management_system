import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SurgiKit</h3>
            <p>Modern system for managing medical equipment in healthcare facilities.</p>
          </div>

          <div className="footer-section">
            <h4>Navigation</h4>
            <ul>
              <li><a href="#about">About System</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contacts</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contacts</h4>
            <p>Email: info@surgikit.ua</p>
            <p>Phone: +380 XX XXX XX XX</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} SurgiKit. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
