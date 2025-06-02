const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Initialize Google OAuth login
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { session: false }),    async (req, res) => {
        try {
            // Create JWT token
            const token = jwt.sign(
                { _id: req.user._id },
                process.env.JWT_SECRET
            );

            // Store token in user's tokens array
            req.user.tokens = req.user.tokens || [];
            req.user.tokens.push({ token });
            await req.user.save();

            // Redirect to frontend with token
            res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`http://localhost:5173/login?error=auth_failed`);
        }
    }
);

// Initialize Google OAuth signup
router.get('/google/signup',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        state: 'signup' // Add state to identify this is a signup flow
    })
);

module.exports = router;
