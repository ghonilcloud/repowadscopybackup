const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags:
 *       - OAuth
 *     summary: Initialize Google OAuth login
 *     description: Redirects the user to Google for authentication
 *     responses:
 *       302:
 *         description: Redirects to Google authentication page
 */
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - OAuth
 *     summary: Google OAuth callback
 *     description: Callback endpoint for Google OAuth authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       302:
 *         description: Redirects to frontend with token or to login page on error
 */
router.get('/google/callback',
    passport.authenticate('google', { session: false }),    async (req, res) => {
        try {
            // Create JWT token
            const token = jwt.sign(
                { _id: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Store token in user's tokens array
            req.user.tokens = req.user.tokens || [];
            req.user.tokens.push({ token });
            
            // Keep only the latest 5 tokens (optional token limit)
            if (req.user.tokens.length > 5) {
                req.user.tokens = req.user.tokens.slice(-5);
            }
            
            await req.user.save();

            // Redirect to frontend with token
            res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`http://localhost:5173/login?error=auth_failed`);
        }
    }
);

/**
 * @swagger
 * /auth/google/signup:
 *   get:
 *     tags:
 *       - OAuth
 *     summary: Initialize Google OAuth signup
 *     description: Redirects the user to Google for authentication with signup state
 *     responses:
 *       302:
 *         description: Redirects to Google authentication page
 */
router.get('/google/signup',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        state: 'signup' // Add state to identify this is a signup flow
    })
);

module.exports = router;