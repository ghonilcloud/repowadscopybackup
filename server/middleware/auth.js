const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // First try to find user with token in tokens array
    let user = await User.findOne({ 
      _id: decoded._id,
      'tokens.token': token 
    });

    // If not found, try to find just by _id (for backward compatibility)
    if (!user) {
      user = await User.findOne({ _id: decoded._id });
      // Add token to user's tokens array if found
      if (user) {
        user.tokens = user.tokens || [];
        user.tokens.push({ token });
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found or token is invalid' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;