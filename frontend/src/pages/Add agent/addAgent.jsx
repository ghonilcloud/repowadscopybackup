import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header-admin-add-agent';
import AgentCreationModal from '../../components/AgentCreationModal';
import authService from '../../services/authService';
import './addAgent.css';

function AddAgent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdAgent, setCreatedAgent] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    password: "",
    role: "service_agent"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Register the new agent using the API
      const response = await authService.register({
        ...formData,
        role: "service_agent" // Ensure role is set
      });

      // Save the current form data before resetting
      setCreatedAgent({...formData});
      
      // Show success modal
      setShowModal(true);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        password: "",
        role: "service_agent"
      });
    } catch (error) {
      setError(error.message || "Failed to create agent account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-agent-page">
      <Header />
      <main className="add-agent-container">
        <h2>Create Service Agent Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="agent-form">
          <div className="form-row">
            <label>
              <span>First Name</span>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange}
                required 
              />
            </label>
            
            <label>
              <span>Last Name</span>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange}
                required 
              />
            </label>
          </div>

          <label>
            <span>Email</span>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </label>

          <label>
            <span>Phone</span>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </label>

          <div className="form-row">
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
          </div>

          <label>
            <span>Password</span>
            <input 
              type="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </label>

          <p className="role-notice">This account will be created with Service Agent role</p>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Agent Account"}
          </button>
        </form>
      </main>

      <AgentCreationModal 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCreatedAgent(null);
        }}
        agentData={createdAgent}
      />
    </div>
  );
}

export default AddAgent;