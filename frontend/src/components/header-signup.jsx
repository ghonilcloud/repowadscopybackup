import React from 'react';
import '../styles/header.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
      <header className="header">
        <Link to="/"><h1 className="logo">Cottoneight</h1></Link>
        <div className='btn-container'>
          <Link to="/login"><button className="btn">Log In</button></Link>
          <Link to="/signup"><button className="btn active">Sign Up</button></Link>
        </div>
      </header>
    );
  };
  
  export default Header;