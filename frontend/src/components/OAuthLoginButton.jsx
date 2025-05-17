import React from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthLoginButton = ({ isSignup = false }) => {
    const handleGoogleAuth = () => {
        // Redirect to backend OAuth route with signup flag
        const endpoint = isSignup ? '/api/auth/google/signup' : '/api/auth/google';
        window.location.href = `http://localhost:5173${endpoint}`;
    };

    return (
        <div className="oauth-login-container">
            <button 
                onClick={handleGoogleAuth}
                className="google-login-button"
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    style={{ width: '20px', height: '20px' }}
                />
                {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
        </div>
    );
};

export default OAuthLoginButton;
