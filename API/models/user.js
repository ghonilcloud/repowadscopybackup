const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  role: {
    type: String,
    enum: ['customer', 'service_agent', 'admin'],
    default: 'customer'
  },
  address: addressSchema,  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google OAuth
    },
    minlength: 7,
    trim: true
  },
  profilePicture: {
    public_id: String,
    url: String
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  }
}, {
  timestamps: true
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Generate OTP
userSchema.methods.generateOTP = async function() {
  const user = this;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  user.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000) // 3 minutes expiry
  };
  await user.save();
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = async function(code) {
  const user = this;
  if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
    throw new Error('No OTP found');
  }
  
  if (Date.now() > user.otp.expiresAt) {
    throw new Error('OTP has expired');
  }
  
  if (user.otp.code !== code) {
    throw new Error('Invalid OTP');
  }
  
  user.isVerified = true;
  user.otp = undefined;
  await user.save();
  return true;
};

// Login credentials check
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login');
  }
  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in');
  }
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;