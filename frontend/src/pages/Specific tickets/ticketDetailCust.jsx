import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/header-cust-my-tickets";
import FileAttachments from '../../components/FileAttachments';
import SatisfactionSurveyModal from '../../components/SatisfactionSurveyModal';
import ticketService from '../../services/ticketService';
import chatService from '../../services/chatService';
import './ticketDetail.css';

const TicketDetailCust = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showSurvey, setShowSurvey] = useState(false);
    const chatBodyRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetch user data
                const userResponse = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const user = await userResponse.json();
                
                if (user.role !== 'customer') {
                    navigate('/login');
                    return;
                }

                setUserData(user);

                // Fetch ticket details
                const ticketData = await ticketService.getTicketById(ticketId);
                setTicket(ticketData);

                // Fetch chat messages
                const messagesData = await chatService.getMessages(ticketId);
                setMessages(messagesData);

            } catch (err) {
                console.error("Error:", err);
                setError(err.message || "Failed to load ticket details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ticketId, navigate]);

    useEffect(() => {
        // Scroll to bottom of chat when new messages are added
        if (chatBodyRef.current && showChat) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, showChat]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const message = await chatService.sendMessage(ticketId, newMessage);
            setMessages(prev => [...prev, message]);
            setNewMessage('');
        } catch (err) {
            console.error("Error sending message:", err);
            // Show error toast or message
        }
    };

    const handleSubmitSurvey = async (surveyData) => {
        try {
            await ticketService.submitSurvey(ticketId, {
                rating: surveyData.rating,
                feedback: surveyData.feedback
            });
            setShowSurvey(false);
            // Refresh ticket data to show updated rating
            const updatedTicket = await ticketService.getTicketById(ticketId);
            setTicket(updatedTicket);
        } catch (err) {
            console.error("Error submitting survey:", err);
            // Show error toast or message
        }
    };

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
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/my-tickets')} className="back-btn">
                        Back to My Tickets
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header userData={userData} />
            <div className="ticket-detail">
                <button onClick={() => navigate('/my-tickets')} className="back-btn">
                    Back
                </button>

                <h1 className="subject">{ticket.subject}</h1>
                <p className="ticket-id">Ticket ID: {ticket.ticketId}</p>

                <div className="ticket-info">
                    <p className={`category ${ticket.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {ticket.category}
                    </p>
                    <p className={`status ${ticket.status}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                    </p>
                    <p>Created: {formatDate(ticket.createdAt)}</p>
                    <p>Handler: {ticket.handler || 'Not Assigned'}</p>
                </div>

                <div className="description">
                    <h3>Description</h3>
                    <p>{ticket.description}</p>
                </div>

                {ticket.attachments && ticket.attachments.length > 0 && (
                    <FileAttachments files={ticket.attachments} />
                )}

                {ticket.updates && ticket.updates.length > 0 && (
                    <div className="ticket-updates">
                        <h3>Updates</h3>
                        {ticket.updates.map((update, index) => (
                            <div key={index} className="update-item">
                                <p className="update-time">{formatDate(update.timestamp)}</p>
                                {Array.from(update.changes).map(([key, value], i) => (
                                    <p key={i} className="update-detail">
                                        {key}: {value.from} → {value.to}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {ticket.rating && (
                    <div className="ticket-rating">
                        <h3 className="rating-title">Your Rating</h3>
                        <div className="rating-stars">
                            {'★'.repeat(ticket.rating)}{'☆'.repeat(5 - ticket.rating)}
                        </div>
                        {ticket.ratingFeedback && (
                            <p className="rating-feedback">{ticket.ratingFeedback}</p>
                        )}
                    </div>
                )}

                {/* Chat Icon */}
                <div className="chat-icon" onClick={() => setShowChat(true)}>
                    💬
                </div>

                {/* Chat Popup */}
                {showChat && (
                    <div className="chatbox-popup">
                        <div className="chatbox-header">
                            <span>Chat</span>
                            <span className="close-chat" onClick={() => setShowChat(false)}>×</span>
                        </div>
                        <div className="chatbox-body" ref={chatBodyRef}>
                            {messages.length === 0 ? (
                                <div className="no-messages">No messages yet</div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`chat-message ${msg.senderRole === 'customer' ? 'user' : 'agent'}`}
                                    >
                                        <p>{msg.message}</p>
                                        <span className="chat-time">{formatDate(msg.createdAt)}</span>
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

                {/* Survey Modal */}
                {ticket.status === 'resolved' && !ticket.rating && (
                    <SatisfactionSurveyModal
                        isOpen={showSurvey}
                        onClose={() => setShowSurvey(false)}
                        onSubmit={handleSubmitSurvey}
                        ticketId={ticket.ticketId}
                    />
                )}

                {/* Show survey button if ticket is resolved and not rated */}
                {ticket.status === 'resolved' && !ticket.rating && (
                    <button 
                        className="survey-btn"
                        onClick={() => setShowSurvey(true)}
                    >
                        Rate Your Experience
                    </button>
                )}
            </div>
        </>
    );
};

export default TicketDetailCust;
