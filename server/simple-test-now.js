// Simple test to check if the faculty user can be found
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    const email = 'faculty@test.com';
    const password = 'faculty123';
    
    console.log(`🔍 Looking for user: ${email}`);
    
    // Find user
    const user = await User.findOne({ email: email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Role:', user.role);
    console.log('🔐 Password hash exists:', !!user.password);
    
    // Test password
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔓 Password match:', isMatch);
    }
    
    // Test without password selection
    const userNoPassword = await User.findOne({ email: email });
    console.log('👤 User without password field:', userNoPassword ? userNoPassword.name : 'Not found');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testLogin();
