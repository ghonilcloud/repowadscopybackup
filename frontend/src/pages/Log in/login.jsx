import React, { useState } from "react";
import "./login.css";
import Header from "../../components/header-login";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from "../../services/authService";
import OAuthLoginButton from '../../components/OAuthLoginButton';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(formData);
      setLoading(false);
      
      // Navigate based on user role
      const rolePath = {
        customer: "/cust-home",
        service_agent: "/agent-home",
        admin: "/admin-home"
      };

      // If there was a requested page before login, go there instead
      const destination = location.state?.from?.pathname || rolePath[response.user.role] || '/';
      navigate(destination);
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-card">
        <h2>Log In</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <label>
            <span>Email</span>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email" 
              required 
            />
          </label>
          <label>
            <span>Password</span>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password" 
              required 
            />
          </label>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
          
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
        
        <div className="oauth-section">
          <div className="divider">
            <span>OR</span>
          </div>
          <OAuthLoginButton />
        </div>
      </div>
    </div>
  );
};

export default Login;