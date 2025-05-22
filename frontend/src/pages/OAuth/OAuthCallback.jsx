import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [phoneRequired, setPhoneRequired] = useState(false);
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchUserAndRedirect = async () => {
            const token = searchParams.get('token');
            if (!token) {
                navigate('/login');
                return;
            }            try {
                // Store the token temporarily
                localStorage.setItem('token', token);                // Fetch user data to determine role
                const response = await fetch('http://localhost:3000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }                const user = await response.json();                // Check if this is a new user (needs to complete signup)
                if (!user.phone || !user.birthDate || !user.gender) {
                    // Store token temporarily
                    localStorage.setItem('temp_token', token);
                    navigate('/signup/complete');
                    return;
                }

                // For existing users, proceed with normal login
                login(token);

                // Redirect based on user role
                const rolePaths = {
                    'customer': '/cust-home',
                    'service_agent': '/agent-home',
                    'admin': '/admin-home'
                };

                const redirectPath = rolePaths[user.role] || '/login';
                navigate(redirectPath);
            } catch (error) {
                console.error('Error in OAuth callback:', error);
                setError('Authentication failed. Please try again.');
                navigate('/login');
            }
        };

        fetchUserAndRedirect();
    }, [searchParams, navigate, login]);    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = searchParams.get('token');
            const response = await fetch('http://localhost:3000/api/user/complete-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ phone })
            });

            if (!response.ok) {
                throw new Error('Failed to complete signup');
            }

            // After successful phone number submission, proceed with login
            login(token);
            navigate('/cust-home');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            gap: '20px'
        }}>
            {phoneRequired ? (
                <div className="phone-form-container">
                    <h2>One Last Step</h2>
                    <p>Please provide your phone number to complete signup</p>
                    <form onSubmit={handlePhoneSubmit}>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                        />
                        <button type="submit">Complete Signup</button>
                    </form>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                </div>
            ) : (
                <>
                    <div>Processing login...</div>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                </>
            )}
        </div>
    );
};

export default OAuthCallback;
