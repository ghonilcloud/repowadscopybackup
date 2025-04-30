const express = require('express');
const router = express.Router();
const { 
    signUp, 
    login, 
    logout, 
    getProfile, 
    updateProfile, 
    getUserById,
    getAgents,
    getCustomers 
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/signup', signUp);
router.post('/login', login);

// Protected routes
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.get('/agents', auth, getAgents);
router.get('/customers', auth, getCustomers);
router.get('/:userId', auth, getUserById);

module.exports = router;