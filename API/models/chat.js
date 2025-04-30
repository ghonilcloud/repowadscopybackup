const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        ref: 'Ticket'
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    senderRole: {
        type: String,
        required: true,
        enum: ['customer', 'service_agent', 'admin']
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
chatSchema.index({ ticketId: 1, createdAt: 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;