const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    const email = 'google@gmail.com';
    const password = 'password';

    console.log(`\n🔑 Testing login for: ${email}`);
    console.log(`🔑 Password: ${password}`);

    // Find user exactly like in login endpoint
    const user = await User.findOne({ email }).populate('role').select('+password');
    console.log('\n📋 User Search Results:');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User details:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role ? user.role.name : 'No role');
      console.log('- Password exists:', user.password ? 'Yes' : 'No');
      
      // Test password comparison exactly like in server
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('\n🔐 Password Test:');
      console.log('- Input password:', password);
      console.log('- Stored hash:', user.password.substring(0, 20) + '...');
      console.log('- Password match:', isMatch ? '✅ Yes' : '❌ No');
      
      if (isMatch) {
        console.log('\n✅ Login should succeed!');
        console.log('User role for redirect:', user.role.name);
      } else {
        console.log('\n❌ Login will fail - Invalid Credentials');
      }
    } else {
      console.log('\n❌ Login will fail - User not found');
    }

  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testLogin();
