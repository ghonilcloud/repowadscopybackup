const mongoose = require('mongoose');

const fileAttachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const updateSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  changes: {
    type: Map,
    of: {
      from: String,
      to: String
    }
  }
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Product Issues',
      'Order and Shipping',
      'Payment and Billing',
      'Website Issues',
      'Technical Support',
      'General Inquiry',
      'Feature Request',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'open', 'in_progress', 'waiting', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical', 'Not Assigned'],
    default: 'Not Assigned'
  },
  handler: {
    type: String,
    default: 'Not Assigned'
  },
  handlerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [fileAttachmentSchema],
  updates: [updateSchema],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  ratingFeedback: String,
  resolvedAt: {
    type: Date
  },
  firstResponseAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create an index on ticketId for faster lookups
ticketSchema.index({ ticketId: 1 });

// Create a compound index on userId and status for filtering user's tickets by status
ticketSchema.index({ userId: 1, status: 1 });

// Create an index on handlerId for finding tickets assigned to an agent
ticketSchema.index({ handlerId: 1 });

// Add index for sorting tickets by status and creation date
ticketSchema.index({ status: 1, createdAt: -1 });

// Add compound index for filtering tickets by handler and status
ticketSchema.index({ handlerId: 1, status: 1 });

// Add index for filtering by priority
ticketSchema.index({ priority: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;