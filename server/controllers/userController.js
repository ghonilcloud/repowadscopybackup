const User = require('../models/user');
const Ticket = require('../models/ticket');
const { userSendMail } = require('./otpController');
const cloudinary = require('../config/cloudinary');

// Store OTPs in memory (in production, use Redis or similar)
const otpStore = new Map();

const signUp = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user already exists and is verified
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with expiration
        otpStore.set(email, {
            otp,
            expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
            userData: req.body // Store the user data temporarily
        });

        // Send OTP email
        await userSendMail(
            email,
            otp,
            "Verify Your Email",
            "Verify Email",
            res
        );

        res.status(200).json({
            message: `Verification code sent to ${email}`
        });
    } catch (error) {
        console.error("Error during signup initiation:", error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const sendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists and is verified
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'Email is already registered and verified' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with expiration
        otpStore.set(email, {
            otp,
            expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
            userData: req.body // Store the user data temporarily
        });

        await userSendMail(
            email,
            otp,
            "Verify Your Email",
            "Verify Email",
            res
        );

    } catch (error) {
        console.error("Error sending verification:", error);
        res.status(500).json({ message: error.message || 'Failed to send verification email' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Get stored OTP data
        const storedData = otpStore.get(email);
        
        if (!storedData || !storedData.otp) {
            return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Create and save the verified user
        const userData = storedData.userData;
        const newUser = new User({
            ...userData,
            isVerified: true
        });

        await newUser.save();
        const token = await newUser.generateAuthToken();

        // Clear OTP data
        otpStore.delete(email);

        res.json({
            user: {
                _id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            },
            token,
            message: 'Email verified and account created successfully'
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(400).json({ message: error.message || 'Verification failed' });
    }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.json({ 
      user, 
      token,
      message: `Welcome back ${user.firstName}! Login successful.`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];

  try {
    updates.forEach((update) => {
      if (allowedUpdates.includes(update)) {
        req.user[update] = req.body[update];
      }
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    // Only service agents and admins can access other user details
    if (req.user.role !== 'service_agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId).select('-password -tokens');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgents = async (req, res) => {
  try {
    // Only admins can access agent list
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all service agents with their stats
    const agents = await User.find({ role: 'service_agent' }).select('-password -tokens');
    
    // Get tickets stats for each agent
    const agentsWithStats = await Promise.all(agents.map(async (agent) => {
      const tickets = await Ticket.find({ handlerId: agent._id });
      
      const resolvedTickets = tickets.filter(t => t.status === 'resolved');
      const ticketsResolved = resolvedTickets.length;
      
      // Calculate average response time
      let totalResponseTime = 0;
      resolvedTickets.forEach(ticket => {
        if (ticket.resolvedAt && ticket.createdAt) {
          totalResponseTime += (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60); // Convert to minutes
        }
      });
      const avgResponseTime = ticketsResolved > 0 ? totalResponseTime / ticketsResolved : 0;
      
      // Calculate average rating
      const ratedTickets = resolvedTickets.filter(t => t.rating);
      const totalRating = ratedTickets.reduce((sum, t) => sum + t.rating, 0);
      const averageRating = ratedTickets.length > 0 ? totalRating / ratedTickets.length : 0;
      
      return {
        ...agent.toObject(),
        ticketsResolved,
        avgResponseTime,
        averageRating,
        ratingCount: ratedTickets.length
      };
    }));

    res.json({ agents: agentsWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    // Only admins can access customer list
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all customers
    const customers = await User.find({ role: 'customer' }).select('-password -tokens');
    
    // Get ticket counts for each customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const totalTickets = await Ticket.countDocuments({ userId: customer._id });
      return {
        ...customer.toObject(),
        totalTickets
      };
    }));

    res.json({ customers: customersWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to base64
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_pictures',
      resource_type: 'auto'
    });

    // Delete old image if exists
    if (req.user.profilePicture?.public_id) {
      try {
        await cloudinary.uploader.destroy(req.user.profilePicture.public_id);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Update user profile picture
    req.user.profilePicture = {
      public_id: result.public_id,
      url: result.secure_url
    };
    await req.user.save();

    res.json({ 
      profilePicture: req.user.profilePicture,
      message: 'Profile picture updated successfully' 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ 
      message: 'Failed to upload profile picture', 
      error: error.message 
    });
  }
};

const createServiceAgent = async (req, res) => {
    try {
        // Only admins can create service agents
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can create service agents.' });
        }

        const { email } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create the service agent account (already verified)
        const newAgent = new User({
            ...req.body,
            role: 'service_agent',
            isVerified: true
        });

        await newAgent.save();

        // Send welcome email with credentials using the dedicated template
        await userSendMail(
            email,
            req.body.password,  // Original unencrypted password
            null,  // Subject will be set by the email handler
            'Welcome Service Agent',  // Using the new email type
            res
        );

        res.status(201).json({
            message: 'Service agent account created successfully',
            user: {
                _id: newAgent._id,
                email: newAgent.email,
                firstName: newAgent.firstName,
                lastName: newAgent.lastName,
                role: newAgent.role
            }
        });
    } catch (error) {
        console.error('Error creating service agent:', error);
        res.status(500).json({ message: error.message || 'Failed to create service agent account' });
    }
};

const completeOAuthSignup = async (req, res) => {
    try {
        const { phone, birthDate, gender } = req.body;
        const user = req.user;

        // Update user with additional information
        user.phone = phone;
        user.birthDate = birthDate;
        user.gender = gender;
        
        await user.save();

        // Generate new token
        const token = await user.generateAuthToken();

        res.json({
            user,
            token,
            message: 'Signup completed successfully'
        });
    } catch (error) {
        console.error('Error completing OAuth signup:', error);
        res.status(400).json({ message: error.message || 'Failed to complete signup' });
    }
};

module.exports = {
  signUp,
  login,
  logout,
  getProfile,
  updateProfile,
  getUserById,
  getAgents,
  getCustomers,
  sendVerification,
  verifyOTP,
  uploadProfilePicture,
  createServiceAgent,
  completeOAuthSignup
};