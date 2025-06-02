const express = require('express');
const router = express.Router();
const { createTicket, updateTicket, deleteTicket, getTicketDetails, getUserTickets, getAllTickets } = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/tickets/all:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get all tickets
 *     description: Retrieves all tickets (service agents & admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/all', auth, getAllTickets);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get user tickets
 *     description: Retrieves all tickets for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, getUserTickets);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Create a new ticket
 *     description: Creates a new support ticket with optional file attachments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - priority
 *             properties:
 *               title:
 *                 type: string
 *                 description: Ticket title
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *               category:
 *                 type: string
 *                 enum: [technical, billing, general, feature_request]
 *                 description: Ticket category
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Ticket priority
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional file attachments (up to 5 files)
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket created successfully
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', auth, upload.array('attachments', 5), createTicket);

/**
 * @swagger
 * /api/tickets/{ticketId}:
 *   patch:
 *     tags:
 *       - Tickets
 *     summary: Update a ticket
 *     description: Updates an existing ticket with new information and optional attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticket to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New ticket title
 *               description:
 *                 type: string
 *                 description: New ticket description
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *                 description: New ticket status
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: New ticket priority
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New file attachments (up to 5 files)
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket updated successfully
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input or ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:ticketId', auth, upload.array('attachments', 5), updateTicket);

/**
 * @swagger
 * /api/tickets/{ticketId}:
 *   delete:
 *     tags:
 *       - Tickets
 *     summary: Delete a ticket
 *     description: Deletes an existing ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticket to delete
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket deleted successfully
 *       400:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:ticketId', auth, deleteTicket);

/**
 * @swagger
 * /api/tickets/{ticketId}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket details
 *     description: Retrieves detailed information about a specific ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticket to retrieve
 *     responses:
 *       200:
 *         description: Ticket details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:ticketId', auth, getTicketDetails);

module.exports = router;