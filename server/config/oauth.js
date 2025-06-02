const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Verify environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing required OAuth environment variables');
    throw new Error('Missing required OAuth environment variables');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Configure Google Strategy
passport.use(new GoogleStrategy({    clientID: process.env.GOOGLE_CLIENT_ID.trim(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
    callbackURL: "http://localhost:5173/api/auth/google/callback",
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Update user's Google-specific info
            user.googleId = profile.id;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
        }

        // Create new user if doesn't exist
        user = new User({
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            googleId: profile.id,
            role: 'customer', // Default role
            verified: true // Auto-verify Google users
        });

        await user.save();
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));
