import React, { useState, useEffect } from 'react';
import Header from "../../components/header-agent-all-tickets";
import { useNavigate, Link } from 'react-router-dom';
import './ticketsAll.css';
import ticketService from '../../services/ticketService';
import authService from '../../services/authService';

const TicketsAgent = () => {
    const [filterStatus, setFilterStatus] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUserPromise = authService.getCurrentUser();
                const currentUser = await currentUserPromise; // Properly resolve the Promise
                
                if (!currentUser) {
                    navigate("/login");
                    return;
                }
                setUserData(currentUser);
                fetchTickets();
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Error loading user data. Please try again.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const fetchTickets = async () => {
        try {
            const ticketsData = await ticketService.getAllTickets(); // Call the method
            setTickets(ticketsData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setError("Failed to load tickets. Please try again.");
            setLoading(false);
        }
    };

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
            day: 'numeric'
        }).format(date);
    };

    const getCategoryClass = (category) => {
        const categoryMap = {
            'Product Issues': 'product-issues',
            'Order and Shipping': 'shipping',
            'Payment and Billing': 'payment',
            'Website Issues': 'website',
            'Other': 'other'
        };

        return categoryMap[category] || 'other';
    };

    return (
        <>
            <Header userData={userData} />
            <div className="tickets-container">
                <h2 className="title">Assigned Tickets</h2>

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
                                        <path d="M5 8L10 13L15 8" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                {showDropdown && (
                                    <ul className="dropdown-menu">
                                        <li onClick={() => handleFilterClick('')}>All</li>
                                        <li onClick={() => handleFilterClick('new')}>New</li>
                                        <li onClick={() => handleFilterClick('open')}>Open</li>
                                        <li onClick={() => handleFilterClick('resolved')}>Resolved</li>
                                    </ul>
                                )}
                            </div>
                        </div>

                        {filteredTickets.length === 0 ? (
                            <div className="no-tickets">
                                {filterStatus
                                    ? `No ${filterStatus} tickets found`
                                    : "No tickets assigned to you yet"}
                            </div>
                        ) : (
                            <div className="ticket-cards">
                                {filteredTickets.map(ticket => (
                                    <div className="ticket-card" key={ticket.ticketId}>
                                        <p className="subject">{ticket.subject}</p>
                                        <p className="date">{formatDate(ticket.createdAt)}</p>
                                        <p className={`category ${getCategoryClass(ticket.category)}`}>{ticket.category}</p>
                                        <p className="description">{ticket.description}</p>
                                        <p className={`status ${ticket.status}`}>
                                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                        </p>
                                        <Link to={`/ticket-agent/${ticket.ticketId}`}>
                                            <button className="view-btn">View</button>
                                        </Link>
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

export default TicketsAgent;
