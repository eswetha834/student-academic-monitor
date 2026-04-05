const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function debugAuth() {
  try {
    console.log('🔍 Starting Authentication Debug...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check if roles exist
    console.log('📋 Checking roles...');
    const roles = await Role.find();
    console.log('Available roles:', roles.map(r => `${r.name} (ID: ${r._id})`));
    
    if (roles.length === 0) {
      console.log('❌ No roles found! This is the problem.');
      return;
    }

    // 2. Check if users exist
    console.log('\n👥 Checking users...');
    const users = await User.find().populate('role');
    console.log('Existing users:', users.map(u => `${u.name} (${u.email}) - Role: ${u.role?.name || 'No Role'}`));

    // 3. Test role creation
    console.log('\n🔧 Testing role creation...');
    const studentRole = await Role.findOne({ name: 'student' });
    console.log('Student role found:', studentRole ? '✅ Yes' : '❌ No');
    
    // 4. Test user creation with role
    if (studentRole) {
      console.log('\n👤 Testing user creation...');
      const testUser = {
        name: 'Debug User',
        email: 'debug@test.com',
        password: 'debug123',
        role: studentRole._id
      };
      console.log('User data to create:', testUser);
      
      try {
        const newUser = new User(testUser);
        const savedUser = await newUser.save();
        console.log('✅ User created successfully!');
        console.log('Saved user:', {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        });
        
        // Clean up test user
        await User.findByIdAndDelete(savedUser._id);
        console.log('🧹 Test user cleaned up');
        
      } catch (saveError) {
        console.error('❌ User creation failed:', saveError.message);
      }
    }

    // 5. Test JWT token creation
    console.log('\n🔑 Testing JWT creation...');
    const testPayload = { user: { id: 'testid', role: 'student' } };
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '10h' });
    console.log('✅ JWT token created:', testToken.substring(0, 50) + '...');

    // 6. Test JWT verification
    console.log('\n🔍 Testing JWT verification...');
    try {
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET || 'fallback_secret');
      console.log('✅ JWT verification successful:', decoded);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
    }

    console.log('\n🎯 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugAuth();
