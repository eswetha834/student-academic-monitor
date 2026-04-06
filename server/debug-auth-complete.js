const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function debugAuthComplete() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB\n');

    // 1. Check current users
    console.log('📋 CURRENT USERS IN DATABASE:');
    const users = await User.find({}).select('+password');
    console.log(`Total users: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);
      console.log(`  Is Hashed: ${user.password.startsWith('$2')}`);
      console.log('');
    });

    // 2. Test user creation
    console.log('🧪 TESTING USER CREATION:');
    const testUser = {
      name: 'amutha',
      email: 'amutha@gmail.com',
      password: 'amutha123',
      role: 'student'
    };
    
    console.log('Creating user:', testUser);
    
    // Check if user exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('❌ User already exists, deleting...');
      await User.deleteOne({ email: testUser.email });
    }
    
    // Create new user
    const newUser = new User(testUser);
    await newUser.save();
    
    console.log('✅ User created successfully');
    console.log('Stored password hash:', newUser.password.substring(0, 20) + '...');
    console.log('Is properly hashed:', newUser.password.startsWith('$2'));
    
    // 3. Test password comparison
    console.log('\n🔐 TESTING PASSWORD COMPARISON:');
    const isMatch = await bcrypt.compare('amutha123', newUser.password);
    console.log(`Password 'amutha123' matches: ${isMatch}`);
    
    // 4. Test login simulation
    console.log('\n🔑 SIMULATING LOGIN PROCESS:');
    const foundUser = await User.findOne({ email: testUser.email }).select('+password');
    
    if (!foundUser) {
      console.log('❌ User not found during login simulation');
    } else {
      console.log('✅ User found during login simulation');
      console.log('Email:', foundUser.email);
      console.log('Role:', foundUser.role);
      
      const loginMatch = await bcrypt.compare(testUser.password, foundUser.password);
      console.log(`Login password match: ${loginMatch}`);
      
      if (loginMatch) {
        console.log('✅ LOGIN WOULD SUCCEED');
      } else {
        console.log('❌ LOGIN WOULD FAIL');
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAuthComplete();
