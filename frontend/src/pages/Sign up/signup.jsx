import React, { useState } from "react";
import "./signup.css";
import Header from "../../components/header-signup";
import { useNavigate } from 'react-router-dom';
import authService from "../../services/authService";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "customer"
  });
  const [otp, setOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    setError("");
    return true;
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const response = await authService.sendVerificationEmail(formData);
      setEmailSent(true);
      setLoading(false);
      nextStep();
    } catch (error) {
      setError(error.message || "Failed to send verification email");
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <label>
              <span>First Name</span>
              <input type="text" name="firstName" onChange={handleChange} value={formData.firstName} placeholder="Enter your first name" required />
            </label>
            <label>
              <span>Last Name</span>
              <input type="text" name="lastName" onChange={handleChange} value={formData.lastName} placeholder="Enter your last name" required />
            </label>
            <label>
              <span>Birth Date</span>
              <input type="date" name="birthDate" onChange={handleChange} value={formData.birthDate} />
            </label>
            <label>
              <span>Gender</span>
              <select name="gender" onChange={handleChange} value={formData.gender}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
          </>
        );
      case 2:
        return (
          <>
            <label>
              Email
              <input type="email" name="email" onChange={handleChange} value={formData.email} placeholder="Enter your email" required />
            </label>
            <label>
              Phone Number
              <input type="tel" name="phone" onChange={handleChange} value={formData.phone} placeholder="Enter your phone number" required />
            </label>
          </>
        );
      case 3:
        return (
          <>
            <label>
              Password
              <input 
                type="password" 
                name="password" 
                onChange={handleChange} 
                value={formData.password} 
                placeholder="Enter your password (min. 8 characters)" 
                minLength="8"
                required 
              />
            </label>
            <label>
              Confirm Password
              <input 
                type="password" 
                name="confirmPassword" 
                onChange={handleChange} 
                value={formData.confirmPassword} 
                placeholder="Confirm your password"
                minLength="8"
                required 
              />
            </label>
            <p className="role-notice">You are signing up as a customer</p>
          </>
        );
      case 4:
        return (
          <div className="verification-message">
            <div className="otp-icon">📧</div>
            <h3>Email Verification</h3>
            <p>We've sent a verification code to:</p>
            <p className="email-highlight">{formData.email}</p>
            <p className="verification-note">Please enter the code to verify your email</p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={handleOtpChange}
              className="otp-input"
              required
            />
          </div>
        );
      default:
        return <p>Thank you for signing up!</p>;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 3) {
      if (!validatePasswords()) {
        return;
      }
      await sendVerificationEmail();
      return;
    }

    if (step === 4) {
      setLoading(true);
      setError('');
      
      try {
        const response = await authService.verifyOTP(formData.email, otp);
        setLoading(false);
        navigate("/login", { 
          state: { 
            message: "Registration successful! Please log in with your verified email." 
          } 
        });
      } catch (error) {
        setLoading(false);
        setError(error.message || "Verification failed. Please try again.");
      }
      return;
    }

    if (step < 3) {
      nextStep();
    }
  };

  return (
    <div className="signup-page">
      <Header />
      <div className="signup-container">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="progress-circles">
          {[1, 2, 3, 4].map((circle, index) => (
            <React.Fragment key={circle}>
              <div className={`circle ${step === circle ? 'active' : ''} ${step > circle ? 'completed' : ''}`}>
                {circle}
              </div>
              {index < 3 && <div className="line" />}
            </React.Fragment>
          ))}
        </div>
  
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {renderStep()}
            <div className={`button-group ${step === 1 ? 'full-width-button' : ''}`}>
              {step > 1 && <button type="button" onClick={prevStep} disabled={loading}>Back</button>}
              <button
                type="submit"
                style={step === 1 ? { flex: 1 } : {}}
                disabled={loading}
              >
                {step === 4 ? (loading ? "Verifying..." : "Verify & Complete") :
                 step === 3 ? (loading ? "Sending..." : "Send Verification Code") :
                 "Next"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
