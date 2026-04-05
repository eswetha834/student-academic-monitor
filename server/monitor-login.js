const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

// Monitor real-time login attempts
const express = require('express');
const app = express();

app.use(express.json());

// Simple endpoint to check current users
app.get('/check-users', async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    
    const users = await User.find({}).populate('role');
    res.json({
      message: 'Current users in database',
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role.name,
        hasPassword: !!u.password
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🔍 User monitor running on http://localhost:${PORT}`);
  console.log('Check users at: http://localhost:5001/check-users');
});
