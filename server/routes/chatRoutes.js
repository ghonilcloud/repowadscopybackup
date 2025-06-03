const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/chatController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/chat/{ticketId}/messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get chat messages
 *     description: Retrieves all chat messages for a specific ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the ticket to get messages for
 *     responses:
 *       200:
 *         description: List of messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Message ID
 *                       sender:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       content:
 *                         type: string
 *                         description: Message content
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: When the message was sent
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.get('/:ticketId/messages', auth, getMessages);

/**
 * @swagger
 * /api/chat/{ticketId}/messages:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a new message
 *     description: Creates a new message in the specified ticket chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the ticket to add a message to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     sender:
 *                       type: object
 *                       properties:
 *                         _id: 
 *                           type: string
 *                         name:
 *                           type: string
 *                     content:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request - Missing content
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.post('/:ticketId/messages', auth, createMessage);

module.exports = router;