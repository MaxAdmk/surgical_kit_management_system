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
            <p>Сучасна система для управління медичним спорядженням у лікувально-профілактичних закладах.</p>
          </div>

          <div className="footer-section">
            <h4>Навігація</h4>
            <ul>
              <li><a href="#about">Про систему</a></li>
              <li><a href="#features">Можливості</a></li>
              <li><a href="#contact">Контакти</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Контакти</h4>
            <p>Email: info@surgikit.ua</p>
            <p>Телефон: +380 XX XXX XX XX</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} SurgiKit. Все права захищені.</p>
          <div className="footer-links">
            <a href="#privacy">Політика приватності</a>
            <a href="#terms">Умови використання</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
