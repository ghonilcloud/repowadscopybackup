const express = require('express');
const router = express.Router();
const { createTicket, updateTicket, deleteTicket, getTicketDetails, getUserTickets, getAllTickets } = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all tickets (service agents & admin only)
router.get('/all', auth, getAllTickets);

// Get all tickets for the current user
router.get('/', auth, getUserTickets);

// Create a new ticket (requires authentication) with file upload support
router.post('/', auth, upload.array('attachments', 5), createTicket);

// Update a ticket (requires authentication) with file upload support
router.patch('/:ticketId', auth, upload.array('attachments', 5), updateTicket);

// Delete a ticket (requires authentication)
router.delete('/:ticketId', auth, deleteTicket);

// Get ticket details (requires authentication)
router.get('/:ticketId', auth, getTicketDetails);

module.exports = router;