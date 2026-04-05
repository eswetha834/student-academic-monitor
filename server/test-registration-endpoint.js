const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

// Mock Express request
const mockReq = {
  body: {
    name: 'Test User',
    email: 'test@test.com',
    password: 'test123',
    role: 'student'
  }
};

const mockRes = {
  status: (code) => ({ statusCode: code }),
  json: (data) => console.log('Response:', data)
};

async function testRegistration() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('✅ Connected to MongoDB');

    // Test the exact registration logic
    console.log('\n🔍 Testing registration logic...');
    
    // Check if user exists
    const exists = await User.findOne({ email: mockReq.body.email });
    console.log('User exists check:', exists ? '❌ Yes' : '✅ No');

    if (exists) {
      mockRes.status(400).json({ msg: "User already exists" });
      return;
    }

    // Get role from database
    const userRole = await Role.findOne({ name: mockReq.body.role });
    console.log('Role found:', userRole ? '✅ Yes' : '❌ No');

    if (!userRole) {
      mockRes.status(400).json({ msg: "Invalid role specified" });
      return;
    }

    // Test user creation
    console.log('\n👤 Creating user...');
    const testUser = {
      name: mockReq.body.name,
      email: mockReq.body.email,
      password: mockReq.body.password,
      role: userRole._id
    };

    console.log('User data:', testUser);

    const user = new User(testUser);
    await user.save();
    console.log('✅ User saved successfully!');

    mockRes.status(200).json({ msg: "Registered Successfully", token: "mock-token" });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    mockRes.status(500).json({ msg: "Server Error" });
  } finally {
    await mongoose.disconnect();
  }
}

testRegistration();
