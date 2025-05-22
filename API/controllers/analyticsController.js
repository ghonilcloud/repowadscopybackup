const Ticket = require('../models/ticket');
const User = require('../models/user');
const Chat = require('../models/chat');

const getAnalytics = async (req, res) => {
    try {
        // Get total tickets
        const totalTickets = await Ticket.countDocuments();

        // Get resolved tickets percentage
        const resolvedTickets = await Ticket.find({ status: 'resolved' });
        const turnoverRate = totalTickets > 0 ? (resolvedTickets.length / totalTickets) * 100 : 0;

        // Calculate average resolution time
        let totalResolutionTime = 0;
        resolvedTickets.forEach(ticket => {
            if (ticket.resolvedAt) {
                totalResolutionTime += (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60); // Convert to minutes
            }
        });
        const avgResolutionTime = resolvedTickets.length > 0 ? totalResolutionTime / resolvedTickets.length : 0;

        // Calculate average first response time
        const ticketsWithResponse = await Ticket.find({ firstResponseAt: { $exists: true } });
        let totalResponseTime = 0;
        ticketsWithResponse.forEach(ticket => {
            totalResponseTime += (new Date(ticket.firstResponseAt) - new Date(ticket.createdAt)) / (1000 * 60); // Convert to minutes
        });
        const avgResponseTime = ticketsWithResponse.length > 0 ? totalResponseTime / ticketsWithResponse.length : 0;

        // Get users with no tickets (bounce rate)
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const usersWithTickets = await Ticket.distinct('userId');
        const bounceRate = totalUsers > 0 ? ((totalUsers - usersWithTickets.length) / totalUsers) * 100 : 0;

        // Get total messages
        const totalMessages = await Chat.countDocuments();

        // Calculate average customer satisfaction
        const ratedTickets = resolvedTickets.filter(t => t.rating);
        const totalRating = ratedTickets.reduce((sum, t) => sum + t.rating, 0);
        const avgCustomerSatisfaction = ratedTickets.length > 0 ? totalRating / ratedTickets.length : 0;

        // Get tickets grouped by status for the chart
        const ticketsByStatus = await Ticket.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent tickets
        const recentTickets = await Ticket.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'firstName lastName');

        res.json({
            success: true,
            data: {
                totalTickets,
                turnoverRate,
                avgResolutionTime,
                avgResponseTime,
                bounceRate,
                totalMessages,
                avgCustomerSatisfaction,
                ticketsByStatus,
                recentTickets
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAnalytics
};