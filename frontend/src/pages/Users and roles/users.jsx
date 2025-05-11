import React, { useState, useEffect } from 'react';
import Header from "../../components/header-admin-users";
import './users.css';
import { useNavigate } from "react-router-dom";
import analyticsService from "../../services/analyticsService";

const Users = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);
    const [serviceAgents, setServiceAgents] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [metrics, setMetrics] = useState({
        totalAgents: 0,
        totalCustomers: 0,
        avgResolutionTime: 0,
        avgCustomerSatisfaction: 0,
        totalRatings: 0
    });
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
                if (user.role !== 'admin') {
                    navigate('/login');
                    return;
                }
                
                setUserData(user);

                // Get analytics data (includes average resolution time, satisfaction)
                const analyticsData = await analyticsService.getAnalyticsData();

                // Fetch service agents (role = service_agent)
                const agentsResponse = await fetch('/api/user/role/agents', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!agentsResponse.ok) {
                    throw new Error('Failed to fetch service agents');
                }

                const agentsData = await agentsResponse.json();
                setServiceAgents(agentsData.agents);

                // Fetch customers (role = customer)
                const customersResponse = await fetch('/api/user/role/customers', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!customersResponse.ok) {
                    throw new Error('Failed to fetch customers');
                }

                const customersData = await customersResponse.json();
                setCustomers(customersData.customers);

                // Update metrics
                setMetrics({
                    totalAgents: agentsData.agents.length,
                    totalCustomers: customersData.customers.length,
                    avgResolutionTime: analyticsData.avgResolutionTime || 0,
                    avgCustomerSatisfaction: analyticsData.avgCustomerSatisfaction || 0,
                    totalRatings: analyticsData.totalRatings || 0
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Error loading user data. Please try again.");
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Format time in minutes to human-readable format
    const formatTime = (timeInMinutes) => {
        if (timeInMinutes < 60) {
            return `${timeInMinutes.toFixed(1)} min`;
        } else {
            const hours = Math.floor(timeInMinutes / 60);
            const minutes = Math.round(timeInMinutes % 60);
            return `${hours}h ${minutes}m`;
        }
    };

    if (loading) {
        return (
            <>
                <Header userData={userData} />
                <div className="analytics-container">
                    <h2 className="title">Users and Roles</h2>
                    <div className="loading-message">Loading users data...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header userData={userData} />
                <div className="analytics-container">
                    <h2 className="title">Users and Roles</h2>
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header userData={userData} />
            <div className="analytics-container">
                <h2 className="title">Users and Roles</h2>

                <div className="metrics-grid">
                    <div className="metric-card">
                        <h2>{metrics.totalAgents}</h2>
                        <p>Total Customer Service Agents</p>
                        <span>Active service representatives</span>
                    </div>
                    <div className="metric-card">
                        <h2>{metrics.totalCustomers}</h2>
                        <p>Total Customer Accounts</p>
                        <span>Registered user accounts</span>
                    </div>
                    <div className="metric-card">
                        <h2>{metrics.avgCustomerSatisfaction > 0 ? metrics.avgCustomerSatisfaction.toFixed(1) : 'N/A'}</h2>
                        <p>Avg Customer Satisfaction</p>
                        <span>Based on ticket resolution surveys {metrics.totalRatings > 0 ? `(${metrics.totalRatings} ratings)` : ''}</span>
                    </div>
                    <div className="metric-card">
                        <h2>{formatTime(metrics.avgResolutionTime)}</h2>
                        <p>Avg Resolution Time</p>
                        <span>Time from ticket creation to resolution</span>
                    </div>
                </div>

                <div className="analytics-sections">
                    <div className="agents-section">
                        <h2>Customer Service Agents</h2>
                        <table className="agents-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Tickets Resolved</th>
                                    <th>Avg. Response Time</th>
                                    <th>Customer Satisfaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceAgents.length > 0 ? (
                                    serviceAgents.map(agent => (
                                        <tr key={agent._id}>
                                            <td>{`${agent.firstName} ${agent.lastName}`}</td>
                                            <td>{agent.email || 'No Email'}</td>
                                            <td>{agent.phone || 'No Phone'}</td>
                                            <td>{agent.ticketsResolved || 0}</td>
                                            <td>{formatTime(agent.avgResponseTime || 0)}</td>
                                            <td>{agent.averageRating > 0 ? `${agent.averageRating.toFixed(1)} (${agent.ratingCount})` : 'No ratings'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">No service agents found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="cust-section">
                        <h2>Customer Accounts</h2>
                        <table className="cust-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Total Tickets Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length > 0 ? (
                                    customers.map(customer => (
                                        <tr key={customer._id}>
                                            <td>{customer._id.substring(0, 6)}</td>
                                            <td>{`${customer.firstName} ${customer.lastName}`}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phone || 'No Phone'}</td>
                                            <td>{customer.totalTickets || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">No customers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Users;
