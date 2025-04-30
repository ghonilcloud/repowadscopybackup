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
    role: "customer"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

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
              <input type="password" name="password" onChange={handleChange} value={formData.password} placeholder="Enter your password" required />
            </label>
            <p className="role-notice">You are signing up as a customer</p>
          </>
        );
      default:
        return <p>Thank you for signing up!</p>;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.register(formData);
      setLoading(false);
      
      // If registration is successful, redirect to login
      navigate("/login", { 
        state: { 
          message: response.message || "Registration successful! Please log in." 
        } 
      });
    } catch (error) {
      setLoading(false);
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      <Header />
      <div className="signup-container">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="progress-circles">
          {[1, 2, 3].map((circle, index) => (
            <React.Fragment key={circle}>
              <div className={`circle ${step === circle ? 'active' : ''} ${step > circle ? 'completed' : ''}`}>
                {circle}
              </div>
              {index < 2 && <div className="line" />}
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
                {step === 3 ? (loading ? "Creating Account..." : "Sign Up") : "Next"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
