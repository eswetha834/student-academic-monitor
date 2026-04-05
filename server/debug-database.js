const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function debugDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('📊 Database Connection: ✅ Connected');

    // Check all users with detailed info
    const users = await User.find({}).populate('role').select('+password');
    console.log('\n👥 Users in Database:');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role ? user.role.name : 'No role'}`);
      console.log(`   Password Hash: ${user.password ? 'Present (' + user.password.length + ' chars)' : 'Missing'}`);
      console.log(`   Department: ${user.department || 'Not set'}`);
      console.log(`   Semester: ${user.semester || 'Not set'}`);
      console.log(`   Roll Number: ${user.rollNumber || 'Not set'}`);
    });

    // Specifically check google@gmail.com
    const googleUser = await User.findOne({ email: 'google@gmail.com' }).populate('role').select('+password');
    console.log('\n🎯 Google User Check:');
    if (googleUser) {
      console.log('✅ User found:');
      console.log(`   Name: ${googleUser.name}`);
      console.log(`   Email: ${googleUser.email}`);
      console.log(`   Role: ${googleUser.role.name}`);
      console.log(`   Password Hash: ${googleUser.password.substring(0, 30)}...`);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📊 Database Connection: 🔌 Disconnected');
  }
}

debugDatabase();
