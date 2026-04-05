const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Check all roles
    const roles = await Role.find({});
    console.log('\n📋 Available Roles:');
    roles.forEach(role => {
      console.log(`- ${role.name} (${role.displayName}) - ID: ${role._id}`);
    });

    // Check all users
    const users = await User.find({}).populate('role');
    console.log('\n👥 All Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role.name} - ID: ${user._id}`);
    });

    // Test specific users
    const testEmails = ['admin@gmail.com', 'faculty@gmail.com', 'student@gmail.com', 'google@gmail.com'];
    
    console.log('\n🔍 Testing Specific Users:');
    for (const email of testEmails) {
      const user = await User.findOne({ email }).populate('role').select('+password');
      if (user) {
        console.log(`✅ Found: ${email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role.name}`);
        console.log(`   Password Hash: ${user.password ? 'Present' : 'Missing'}`);
        
        // Test password verification
        const testPasswords = ['admin123', 'faculty123', 'student123', 'password'];
        for (const pwd of testPasswords) {
          try {
            const isMatch = await bcrypt.compare(pwd, user.password);
            console.log(`   Password "${pwd}": ${isMatch ? '✅ Match' : '❌ No Match'}`);
          } catch (err) {
            console.log(`   Password "${pwd}": ❌ Error - ${err.message}`);
          }
        }
      } else {
        console.log(`❌ Not Found: ${email}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers();
