import React from 'react';
import './AgentCreationModal.css';

const AgentCreationModal = ({ isOpen, onClose, agentData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agent Created Successfully!</h2>
        <div className="agent-details">
          <p><strong>Name:</strong> {`${agentData.firstName} ${agentData.lastName}`}</p>
          <p><strong>Email:</strong> {agentData.email}</p>
          <p><strong>Role:</strong> Service Agent</p>
        </div>
        <p className="info-message">
          An email has been sent to the agent with their login credentials.
        </p>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AgentCreationModal;