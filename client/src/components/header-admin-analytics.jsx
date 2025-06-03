import React, { useState } from 'react';
import '../styles/header.css';
import { Link } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import HamburgerMenu from './HamburgerMenu';

const Header = ({ userData }) => {
    const [showProfile, setShowProfile] = useState(false);

    return (
      <>
        <header className="header">
          <Link to="/admin-home"><h1 className="logo">Cottoneight</h1></Link>
          <div className="btn-group">
            <div className='btn-container'>
              <Link to="/analytics"><button className="btn active">Analytics</button></Link>
              <Link to="/users-roles"><button className="btn">Users and Roles</button></Link>
              <Link to="/add-agent"><button className="btn">Add Agent</button></Link>
            </div>
            <button className="profile-icon-btn" onClick={() => setShowProfile(true)}>
            {userData?.profilePicture?.url ? (
              <img 
                src={userData.profilePicture.url} 
                alt="Profile" 
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            )}
          </button>
          </div>
                          <HamburgerMenu>
          <Link to="/analytics"><button className="btn">Analytics</button></Link>
          <Link to="/users-roles"><button className="btn">Users and Roles</button></Link>
          <Link to="/add-agent"><button className="btn">Add Agent</button></Link>
          <button className="btn" onClick={() => setShowProfile(true)}>Profile</button>
        </HamburgerMenu>
        </header>

        <ProfileModal 
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          userData={userData}
        />
      </>
    );
  };
  
  export default Header;