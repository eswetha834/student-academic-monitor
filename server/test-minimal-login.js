const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/academic-monitor')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Minimal login route for testing
app.post('/api/login', async (req, res) => {
  console.log('🔍 MINIMAL LOGIN: Request received');
  console.log('🔍 MINIMAL LOGIN: Request body:', req.body);
  console.log('🔍 MINIMAL LOGIN: Request headers:', req.headers);
  
  try {
    const { email, password, role } = req.body;
    
    console.log('🔍 MINIMAL LOGIN: Extracted data:', { email, password: !!password, role });
    
    if (!email || !password) {
      console.log('🔍 MINIMAL LOGIN: Missing email or password');
      return res.status(400).json({ msg: 'Email and password required' });
    }
    
    console.log('🔍 MINIMAL LOGIN: Looking for user:', email);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('🔍 MINIMAL LOGIN: User not found');
      return res.status(400).json({ msg: 'User not found' });
    }
    
    console.log('🔍 MINIMAL LOGIN: User found:', user.name);
    console.log('🔍 MINIMAL LOGIN: Comparing password');
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('🔍 MINIMAL LOGIN: Password mismatch');
      return res.status(400).json({ msg: 'Invalid password' });
    }
    
    console.log('🔍 MINIMAL LOGIN: Password match, generating token');
    
    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, 'test_secret', { expiresIn: '7d' });
    
    console.log('🔍 MINIMAL LOGIN: SUCCESS! Sending response');
    
    res.json({
      msg: 'Login Success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('🔍 MINIMAL LOGIN: ERROR:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Start test server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Minimal login test server running on port ${PORT}`);
  
  // Test the login immediately
  setTimeout(async () => {
    console.log('\n🧪 Testing minimal login endpoint...');
    
    try {
      const axios = require('axios');
      const response = await axios.post(`http://localhost:${PORT}/api/login`, {
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('✅ Minimal login test SUCCESS:', response.status);
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Minimal login test FAILED:', error.response?.data);
    }
    
    process.exit(0);
  }, 1000);
});
