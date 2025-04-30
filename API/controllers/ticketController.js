const Ticket = require('../models/ticket');

// Function to generate a unique ticket ID
const generateTicketId = () => {
  return 'TKT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
};

// Function to process file attachments
const processAttachments = (files) => {
  if (!files) return [];
  return files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: file.path,
    uploadedAt: new Date()
  }));
};

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      ticketId: generateTicketId(),
      userId: req.user._id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      status: 'new'
    };

    // Process any uploaded files
    if (req.files && req.files.length > 0) {
      ticketData.attachments = processAttachments(req.files);
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a ticket
const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updates = req.body;
    
    // Build query based on user role
    const query = { ticketId };
    if (req.user.role !== 'service_agent' && req.user.role !== 'admin') {
      // Regular users can only update their own tickets
      query.userId = req.user._id;
    }

    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    // Set resolvedAt when status changes to resolved
    if (updates.status === 'resolved' && ticket.status !== 'resolved') {
      updates.resolvedAt = new Date();
    }

    // Process any new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = processAttachments(req.files);
      updates.attachments = [...(ticket.attachments || []), ...newAttachments];
    }

    // Create an update record for tracking changes
    const changes = new Map();
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'attachments' && ticket[key] !== value) {
        changes.set(key, {
          from: ticket[key],
          to: value
        });
      }
    }

    if (changes.size > 0) {
      ticket.updates.push({
        timestamp: new Date(),
        changes
      });
    }

    // Apply the updates
    Object.assign(ticket, updates);
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a ticket
const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Build query based on user role
    const query = { ticketId };
    if (req.user.role !== 'service_agent' && req.user.role !== 'admin') {
      // Regular users can only delete their own tickets
      query.userId = req.user._id;
    }

    const ticket = await Ticket.findOneAndDelete(query);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get ticket details
const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Build query based on user role
    const query = { ticketId };
    if (req.user.role !== 'service_agent' && req.user.role !== 'admin') {
      // Regular users can only view their own tickets
      query.userId = req.user._id;
    }

    const ticket = await Ticket.findOne(query)
      .populate('userId', 'firstName lastName email')
      .populate('handlerId', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all tickets for the current user
const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate('handlerId', 'firstName lastName');

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all tickets (for service agents and admins)
const getAllTickets = async (req, res) => {
  try {
    // Check if user is authorized
    if (req.user.role !== 'service_agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only service agents and admins can view all tickets.'
      });
    }

    const query = {};
    const { status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Add filters if provided
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .populate('userId', 'firstName lastName email')
      .populate('handlerId', 'firstName lastName email');

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketDetails,
  getUserTickets,
  getAllTickets
};