const API_URL = '/api/user';

const authService = {
  async sendVerificationEmail(userData) {
    const response = await fetch(`${API_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification email');
    }

    return data;
  },

  async verifyOTP(email, otp) {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Invalid verification code');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  async registerServiceAgent(agentData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/signup/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(agentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register service agent');
    }

    return data;
  },

  async login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  async logout() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async getUserById(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const userIdStr = typeof userId === 'object' && userId._id ? userId._id.toString() : userId.toString();

    const response = await fetch(`${API_URL}/${userIdStr}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user data');
    }

    if (!data || !data.user) {
      throw new Error('User data not found');
    }

    return data.user;
  }
};

export default authService;