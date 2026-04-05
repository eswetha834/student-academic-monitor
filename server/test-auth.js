const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('✅ Connected to MongoDB');

    // Check if roles exist
    const roles = await Role.find();
    console.log('📋 Available roles:', roles.map(r => r.name));

    // Get student role
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      console.log('❌ Student role not found');
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test Student',
      email: 'test@student.com',
      password: 'test123',
      role: studentRole._id,
      department: 'Computer Science',
      semester: '4',
      rollNumber: 'TEST001'
    });

    await testUser.save();
    console.log('✅ Test user created');

    // Test login
    const loginPayload = { user: { id: testUser._id, role: 'student' } };
    const token = jwt.sign(loginPayload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '10h' });
    console.log('🔑 Token generated:', token.substring(0, 50) + '...');

    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('✅ Token verified:', decoded);

    // Test user population
    const user = await User.findById(decoded.user.id).populate('role');
    console.log('👤 User with role:', {
      name: user.name,
      email: user.email,
      role: user.role.name,
      department: user.department
    });

    console.log('🎉 Authentication test completed successfully!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAuth();
