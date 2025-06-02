import React, { useState, useEffect } from 'react';
import './analytics.css';
import Header from "../../components/header-admin-analytics";
import analyticsService from "../../services/analyticsService";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);
    const [realTickets, setRealTickets] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalTickets: 0,
        turnoverRate: 0,
        bounceRate: 0,
        totalMessages: 0
    });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
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
                const response = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const user = await response.json();
                if (user.role !== 'admin') {
                    navigate('/login');
                    return;
                }
                setUserData(user);

                // Fetch analytics data
                const analyticsData = await analyticsService.getAnalyticsData();
                setAnalytics({
                    totalTickets: analyticsData.totalTickets,
                    turnoverRate: analyticsData.turnoverRate,
                    bounceRate: analyticsData.bounceRate,
                    totalMessages: analyticsData.totalMessages
                });

                // Process tickets by status for chart
                const statusData = analyticsData.ticketsByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {});

                const chartLabels = Object.keys(statusData).map(status => 
                    status.charAt(0).toUpperCase() + status.slice(1)
                );
                
                const chartValues = Object.values(statusData);

                setChartData({
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Number of Tickets',
                            data: chartValues,
                            backgroundColor: [
                                'rgba(177, 178, 181, 0.7)',  // new - gray
                                'rgba(159, 197, 248, 0.7)',  // open - blue
                                'rgba(245, 245, 119, 0.7)',  // pending - yellow
                                'rgba(255, 119, 109, 0.7)',  // on-hold - red
                                'rgba(182, 215, 168, 0.7)',  // resolved - green
                            ],
                            borderColor: [
                                'rgba(177, 178, 181, 1)',
                                'rgba(159, 197, 248, 1)',
                                'rgba(245, 245, 119, 1)',
                                'rgba(255, 119, 109, 1)',
                                'rgba(182, 215, 168, 1)',
                            ],
                            borderWidth: 1
                        }
                    ]
                });

                // Set recent tickets
                setRealTickets(analyticsData.recentTickets);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Format numbers and percentages
    const formatNumber = (num) => {
        return num.toLocaleString();
    };
    
    const formatPercent = (percent) => {
        return percent.toFixed(1) + '%';
    };

    // Format date for display
    const formatDate = (timestamp) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(timestamp));
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Tickets by Status',
                font: {
                    size: 16
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    if (loading) {
        return (
            <>
                <Header userData={userData} />
                <div className="loading-container">Loading analytics data...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header userData={userData} />
                <div className="analytics-container">
                    <h2 className="title">Analytics Dashboard</h2>
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header userData={userData} />
            <div className="analytics-container">
                <h2 className="title">Analytics Dashboard</h2>
                
                <div className="metrics-grid">
                    <div className="metric-card">
                        <h2>{formatNumber(analytics.totalTickets)}</h2>
                        <p>Total Tickets</p>
                        <span>Real-time data from MongoDB</span>
                    </div>
                    <div className="metric-card">
                        <h2>{formatPercent(analytics.turnoverRate)}</h2>
                        <p>Ticket Turnover Rate</p>
                        <span>Percentage of resolved tickets</span>
                    </div>
                    <div className="metric-card">
                        <h2>{formatPercent(analytics.bounceRate)}</h2>
                        <p>Bounce Rate</p>
                        <span>Customers with no tickets</span>
                    </div>
                    <div className="metric-card">
                        <h2>{formatNumber(analytics.totalMessages)}</h2>
                        <p>Total Customer Interactions</p>
                        <span>Total chat messages sent</span>
                    </div>
                </div>

                <div className="analytics-sections">
                    <div className="tickets-section">
                        <h2>Recent Tickets</h2>
                        <table className="tickets-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {realTickets.map((ticket) => (
                                    <tr key={ticket._id}>
                                        <td>{ticket.ticketId}</td>
                                        <td>{ticket.subject}</td>
                                        <td>{`${ticket.userId.firstName} ${ticket.userId.lastName}`}</td>
                                        <td>{formatDate(ticket.createdAt)}</td>
                                        <td>{ticket.category}</td>
                                        <td className={ticket.priority.toLowerCase()}>
                                            {ticket.priority}
                                        </td>
                                        <td>
                                            <span className={`status ${ticket.status}`}>
                                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {realTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="no-tickets">No tickets available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="chart-section">
                        <h2>Tickets by Status</h2>
                        <div className="chart-container">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Analytics;
