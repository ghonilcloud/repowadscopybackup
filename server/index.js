const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');

// Load environment variables first
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Import Swagger configuration
const { specs, swaggerUi } = require('./config/swagger');

// Initialize OAuth configuration
require('./config/oauth');

// Middleware setup
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.CONNECTION_URL,
        ttl: 14 * 24 * 60 * 60, // = 14 days session TTL
        crypto: {
            secret: process.env.JWT_SECRET
        }
    })
}));

// Initialize Passport and CORS
app.use(passport.initialize());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const oauthRoutes = require('./routes/oauthRoutes');

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// // Serve Swagger documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// // Routes - make sure these are all using proper path patterns
// app.use('/api/user', userRoutes);
// app.use('/api/tickets', ticketRoutes);
// app.use('/api/chat', chatRoutes); // Check if this should be "chat" or "chats"
// app.use('/api/analytics', analyticsRoutes);
// app.use('/auth', oauthRoutes);

// Catch-all route for React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_URL, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    retryWrites: true,
    maxPoolSize: 10
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Add retry logic for connection
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(() => {
        mongoose.connect(process.env.CONNECTION_URL)
            .catch(err => console.error('Reconnection failed:', err));
    }, 5000);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export for testing purposes