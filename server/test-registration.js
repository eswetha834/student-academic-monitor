const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function testRegistration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Check if roles exist
    const roles = await Role.find();
    console.log('Available roles:', roles.map(r => ({ name: r.name, id: r._id })));

    // Check if student role exists
    const studentRole = await Role.findOne({ name: 'student' });
    console.log('Student role:', studentRole);

    // Test user creation
    if (studentRole) {
      const testUser = {
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test123',
        role: studentRole._id
      };
      console.log('Test user data:', testUser);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testRegistration();
