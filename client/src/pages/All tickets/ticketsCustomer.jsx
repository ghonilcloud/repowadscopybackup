import React, { useState, useEffect } from 'react';
import Header from "../../components/header-cust-my-tickets";
import { useNavigate } from 'react-router-dom';
import './ticketsAll.css';
import ticketService from '../../services/ticketService';

const TicketsCust = () => {
    const [filterStatus, setFilterStatus] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetch user profile
                const userResponse = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const user = await userResponse.json();
                
                // Check if user has customer role
                if (user.role !== 'customer') {
                    navigate('/login');
                    return;
                }

                setUserData(user);

                // Fetch tickets
                const ticketsData = await ticketService.getTicketsByUser();
                setTickets(ticketsData);
            } catch (err) {
                console.error("Error:", err);
                setError(err.message || "An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };
  
    const filteredTickets = filterStatus
        ? tickets.filter(ticket => ticket.status === filterStatus)
        : tickets;
  
    const handleFilterClick = (status) => {
        setFilterStatus(status);
        setShowDropdown(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getCategoryClass = (category) => {
        const categoryMap = {
            'Product Issues': 'product-issues',
            'Order and Shipping': 'shipping',
            'Payment and Billing': 'payment',
            'Website Issues': 'website',
            'Technical Support': 'technical',
            'General Inquiry': 'general',
            'Feature Request': 'feature',
            'Other': 'other'
        };
        return categoryMap[category] || 'other';
    };

    const renderRating = (ticket) => {
        if (!ticket.rating) return null;
        const stars = '★'.repeat(ticket.rating) + '☆'.repeat(5 - ticket.rating);
        return (
            <div className="ticket-rating">
                <span className="stars">{stars}</span>
                {ticket.ratingFeedback && (
                    <p className="rating-feedback">{ticket.ratingFeedback}</p>
                )}
            </div>
        );
    };
  
    return (
        <>
            <Header userData={userData} />
            <div className="tickets-container">
                <h2 className="title">My Tickets</h2>
                {loading ? (
                    <div className="loading">Loading tickets...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <div className="filter-section">
                            <div className="dropdown">
                                <button className="dropdown-toggle" onClick={toggleDropdown}>
                                    <span>Filter {filterStatus && `(${filterStatus})`}</span>
                                    <svg className="arrow-down" width="12" height="12" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 8L10 13L15 8" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {showDropdown && (
                                    <ul className="dropdown-menu">
                                        <li onClick={() => handleFilterClick('')}>All</li>
                                        <li onClick={() => handleFilterClick('new')}>New</li>
                                        <li onClick={() => handleFilterClick('open')}>Open</li>
                                        <li onClick={() => handleFilterClick('in_progress')}>In Progress</li>
                                        <li onClick={() => handleFilterClick('waiting')}>Waiting</li>
                                        <li onClick={() => handleFilterClick('resolved')}>Resolved</li>
                                        <li onClick={() => handleFilterClick('closed')}>Closed</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                        {filteredTickets.length === 0 ? (
                            <div className="no-tickets">
                                {filterStatus 
                                    ? `No ${filterStatus} tickets found` 
                                    : "You haven't submitted any tickets yet"}
                            </div>
                        ) : (
                            <div className="ticket-cards">
                                {filteredTickets.map(ticket => (
                                    <div className="ticket-card" key={ticket.ticketId}>
                                        <div className="ticket-header">
                                            <p className="subject">{ticket.subject}</p>
                                            <p className="date">{formatDate(ticket.createdAt)}</p>
                                        </div>
                                        <p className={`category ${getCategoryClass(ticket.category)}`}>
                                            {ticket.category}
                                        </p>
                                        <p className="description">{ticket.description}</p>
                                        <div className="ticket-footer">
                                            <p className={`status ${ticket.status}`}>
                                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                            </p>
                                            <button 
                                                className="view-btn"
                                                onClick={() => navigate(`/ticket/${ticket.ticketId}`)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default TicketsCust;