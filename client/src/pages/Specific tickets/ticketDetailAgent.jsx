import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import Header from "../../components/header-agent-all-tickets";
import authService from '../../services/authService';
import FileAttachments from '../../components/FileAttachments';
import SatisfactionSurveyModal from '../../components/SatisfactionSurveyModal';
import ticketService from '../../services/ticketService';
import chatService from '../../services/chatService';
import './ticketDetailAgent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


const TicketDetailAgent = () => {
  const [showChatbox, setShowChatbox] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [customerDataLoading, setCustomerDataLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  const chatBodyRef = useRef(null);
  const { ticketId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user || user.role !== 'service_agent') {
            navigate('/login');
            return;
        }

        setUserData(user);

        // Fetch ticket details
        const ticketData = await ticketService.getTicketById(ticketId);
        if (!ticketData) {
          throw new Error('Ticket not found');
        }
        setTicket(ticketData);

        try {
          // Fetch chat messages - don't fail the whole component if chat fails
          const messagesData = await chatService.getMessages(ticketId);
          setChatMessages(messagesData || []);
        } catch (chatErr) {
          console.error("Error fetching chat messages:", chatErr);
          // Don't set the main error state, just show empty messages
          setChatMessages([]);
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Failed to load ticket details");
        // Redirect to all tickets if ticket is not found
        if (err.message.includes('not found')) {
          setTimeout(() => navigate('/all-tickets'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, navigate]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current && showChatbox) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, showChatbox]);

  // Fetch customer data when ticket is loaded
  useEffect(() => {
    if (ticket && ticket.userId) {
      fetchCustomerData(ticket.userId);
    }
  }, [ticket]);

  const fetchCustomerData = async (userId) => {
    try {
      setCustomerDataLoading(true);
      const data = await authService.getUserById(userId);
      setCustomerData(data);
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError("Failed to load customer details");
    } finally {
      setCustomerDataLoading(false);
    }
  };

  const toggleChatbox = () => setShowChatbox((prev) => !prev);

  const toggleCustomerDetails = () => setShowCustomerDetails((prev) => !prev);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getCategoryClass = (category) => {
    const categoryMap = {
      'Product Issues': 'product-issues',
      'Order and Shipping': 'shipping',
      'Payment and Billing': 'payment',
      'Website Issues': 'website',
      'Other': 'other',
    };
    return categoryMap[category] || 'other';
  };

  const handleChange = (field, value) => {
    setEditedTicket((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = () => {
    if (isEditing) {
      saveTicket();
    } else {
      setEditedTicket({
        handler: ticket.handler,
        priority: ticket.priority,
        status: ticket.status
      });
      setIsEditing(true);
    }
  };

  const saveTicket = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const updateData = {
        handler: editedTicket.handler,
        priority: editedTicket.priority,
        status: editedTicket.status,
        handlerId: userData._id // Using _id instead of id to match MongoDB
      };

      const updatedTicket = await ticketService.updateTicket(ticketId, updateData);
      setTicket(updatedTicket);
      setIsEditing(false);
      setSuccessMessage("Ticket updated successfully");

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    const tempId = Date.now().toString();
    // Add temporary message
    setChatMessages(prev => [...prev, {
        id: tempId,
        message: newMessage,
        senderRole: 'service_agent',
        createdAt: null // null indicates pending state
    }]);

    setSendingMessage(true);
    try {
        const message = await chatService.sendMessage(ticketId, newMessage);
        // Replace temporary message with actual message
        setChatMessages(prev => prev.map(msg => 
            msg.id === tempId ? message : msg
        ));
        setNewMessage('');
    } catch (err) {
        console.error("Error sending message:", err);
        // Remove failed message
        setChatMessages(prev => prev.filter(msg => msg.id !== tempId));
        setError("Failed to send message. Please try again.");
        setTimeout(() => setError(''), 3000);
    } finally {
        setSendingMessage(false);
    }
};

  if (loading) {
    return (
      <>
        <Header userData={userData} />
        <div className="loading-container">Loading ticket details...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header userData={userData} />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="back-btn" onClick={() => navigate(-1)}>Back to Tickets</button>
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <Header userData={userData} />
        <div className="error-container">
          <p className="error-message">Ticket not found</p>
          <button className="back-btn" onClick={() => navigate(-1)}>Back to Tickets</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header userData={userData} />
      <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

      <div className="ticket-detail">
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        
        <div className="profile-section">
          <div className="avatar">👤</div>
          <div>
            <h3>{ticket.name}</h3>
            <p className="ticket-id">Ticket ID #{ticket.ticketId}</p>
          </div>
          
          <button 
            className="customer-details-btn"
            onClick={toggleCustomerDetails}
            disabled={customerDataLoading}
            title={showCustomerDetails ? "Hide Customer Details" : "Show Customer Details"}
          >
            {customerDataLoading ? '...' : (
              <FontAwesomeIcon icon={showCustomerDetails ? faEyeSlash : faEye} />
            )}
          </button>
        </div>

        {showCustomerDetails && (customerDataLoading ? (
          <div className="customer-details-panel">
            <p>Loading customer details...</p>
          </div>
        ) : customerData ? (
          <div className="customer-details-panel">
            <h3>Customer Information</h3>
            <div className="customer-info-grid">
              <div className="info-item">
                <span className="info-label">Full Name: </span>
                <span className="info-value">{customerData.firstName} {customerData.lastName}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email: </span>
                <span className="info-value">{customerData.email || 'Not provided'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Phone: </span>
                <span className="info-value">{customerData.phone || 'Not provided'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Account Created: </span>
                <span className="info-value">{customerData.createdAt ? formatDate(customerData.createdAt) : 'Unknown'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Address: </span><br></br>
                <span className="info-value">
                  {customerData.address ? (
                    <>
                      {customerData.address.street ? (
                        <>
                          {customerData.address.street}<br />
                          {customerData.address.city ? `${customerData.address.city}, ` : ''}
                          {customerData.address.state || ''} {customerData.address.zip || ''}<br />
                          {customerData.address.country || ''}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </>
                  ) : 'Not provided'}
                </span>
              </div>
              <br></br>
            </div>
          </div>
        ) : null)}

        <h2 className='subject'>{ticket.subject}</h2>
        <p>Created {formatDate(ticket.createdAt)} by {ticket.name}</p>

        <p className={`category ${getCategoryClass(ticket.category)}`}>{ticket.category}</p>
        <p>{ticket.description}</p>

        {/* Display attachments if they exist */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <FileAttachments 
            files={ticket.attachments} 
            allowDownload={true}
            showPreview={true}
          />
        )}

        <div className="input-pair">
          <div className="input-group">
            <label>Handled by</label>
            {isEditing ? (
              <select
                value={editedTicket.handler === "Not Assigned" ? "" : editedTicket.handler}
                onChange={(e) => handleChange('handler', e.target.value || "Not Assigned")}
                disabled={saving}
              >
                <option value="">Not Assigned</option>
                <option value={`${userData.firstName} ${userData.lastName}`}>Assign to Me</option>
              </select>
            ) : (
              <p className={ticket.handler === 'Not Assigned' ? 'not-assigned' : 'handler'}>
                {ticket.handler}
              </p>
            )}
          </div>
          
          <div className="input-group">
            <label>Priority</label>
            {isEditing ? (
              <select
                value={editedTicket.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                disabled={saving}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            ) : (
              <p className={`priority ${ticket.priority}`}>
                {ticket.priority}
              </p>
            )}
          </div>
        </div>
        
        <div className="input-group">
          <label>Status</label>
          {isEditing ? (
            <select
              value={editedTicket.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={saving}
            >
              <option value="open">{formatStatus('open')}</option>
              <option value="in_progress">{formatStatus('in_progress')}</option>
              <option value="waiting">{formatStatus('waiting')}</option>
              <option value="resolved">{formatStatus('resolved')}</option>
              <option value="closed">{formatStatus('closed')}</option>
            </select>
          ) : (
            <p className={`status ${ticket.status}`}>
              {formatStatus(ticket.status)}
            </p>
          )}
        </div>
          <button 
              className={`edit-btn ${isEditing ? 'saving' : ''}`} 
              onClick={toggleEdit}
          >
              {isEditing ? "Save" : "Edit"}
          </button>

        {ticket.updates && ticket.updates.length > 0 && (
          <div className="ticket-updates">
            <h3>Updates</h3>
            {ticket.updates.map((update, index) => (
              <div key={index} className="update-item">
                <p className="update-time">{formatDate(update.timestamp)}</p>
                {Object.entries(update.changes).map(([field, values]) => (
                  <p key={field} className="update-detail">
                    <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> Changed from "{values.from}" to "{values.to}"
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Chat Icon and Box */}
        <div className="chat-icon" onClick={toggleChatbox}>💬</div>

        {showChatbox && (
        <div className="chatbox-popup">
          <div className="chatbox-header">
            {ticket.name}
            <span className="close-chat" onClick={toggleChatbox}>×</span>
            </div>
          <div className="chatbox-body" ref={chatBodyRef}>
            {chatMessages.length === 0 ? (
              <div className="no-messages">No messages yet. Start the conversation.</div>
            ) : (
              chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-message ${msg.senderRole === 'service_agent' ? 'user' : 'agent'}`}
                >
                  <p>{msg.message}</p>
                  <span className="chat-time">
                    {msg.createdAt ? formatDate(msg.createdAt) : 'Sending...'}
                  </span>
            </div>
              ))
            )}
          </div>
          <div className="chatbox-input">
              <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>➤</button>
          </div>
        </div>
        )}
    </>
  );
};

export default TicketDetailAgent;
