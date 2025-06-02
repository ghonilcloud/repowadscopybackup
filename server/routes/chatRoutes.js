const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.get('/:ticketId/messages', auth, getMessages);
router.post('/:ticketId/messages', auth, createMessage);

module.exports = router;