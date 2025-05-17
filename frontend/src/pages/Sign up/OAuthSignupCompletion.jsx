import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header-signup";
import "./signup.css";

const OAuthSignupCompletion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phone: "",
        birthDate: "",
        gender: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem('temp_token'); // Using temp token from OAuth
            const response = await fetch('http://localhost:3000/api/user/complete-oauth-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete signup');
            }

            // Store the final token and redirect
            localStorage.setItem('token', data.token);
            navigate('/cust-home');
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <Header />
            <div className="signup-container">
                <h2>Complete Your Profile</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <label>
                        <span>Phone Number</span>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </label>

                    <label>
                        <span>Birth Date</span>
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        <span>Gender</span>
                        <select 
                            name="gender" 
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={loading}
                    >
                        {loading ? "Completing signup..." : "Complete Signup"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OAuthSignupCompletion;
