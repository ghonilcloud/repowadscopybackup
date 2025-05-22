const Chat = require('../models/chat');
const Ticket = require('../models/ticket');

// Get all messages for a ticket
const getMessages = async (req, res) => {
    try {
        const { ticketId } = req.params;

        // Verify user has access to this ticket
        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check if user is authorized to view messages
        if (req.user.role !== 'service_agent' && req.user.role !== 'admin' && 
            ticket.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these messages'
            });
        }

        const messages = await Chat.find({ ticketId })
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Send a new message
const createMessage = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;

        // Find the ticket
        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Create the chat message
        const chat = new Chat({
            ticketId,
            senderId: req.user._id,
            senderRole: req.user.role,
            message
        });

        await chat.save();

        // If this is a service agent's first response, update the ticket's firstResponseAt
        if (req.user.role === 'service_agent' && !ticket.firstResponseAt) {
            ticket.firstResponseAt = new Date();
            await ticket.save();
        }

        // Populate sender information
        await chat.populate('senderId', 'firstName lastName');

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    createMessage
};