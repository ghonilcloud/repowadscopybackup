import React, { useState } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-container">
      <button className={`hamburger-button ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        {children}
      </nav>
    </div>
  );
};

export default HamburgerMenu;
