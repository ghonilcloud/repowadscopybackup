const User = require('../models/user');
const Ticket = require('../models/ticket');

const signUp = async (req, res) => {
    const { firstName, lastName, email, password, phone, birthDate, gender, address } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email }).maxTimeMS(5000);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
    
        // Create new user (removed duplicate email and password)
        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password, 
            phone, 
            birthDate, 
            gender,
            address 
        });

        await newUser.save();
        const token = await newUser.generateAuthToken();
    
        // Send response
        res.status(201).json({
            user: {
                _id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            },
            token,
            message: `Welcome ${newUser.firstName}! Your account has been created successfully.`
        });
    } catch (error) {
        console.error("Error during user signup:", error);
        res.status(500).json({ message: error.message || 'Internal server error' });
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
    // Filter out any fields that aren't in allowedUpdates
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

module.exports = {
  signUp,
  login,
  logout,
  getProfile,
  updateProfile,
  getUserById,
  getAgents,
  getCustomers
};