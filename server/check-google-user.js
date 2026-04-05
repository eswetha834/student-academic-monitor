const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkGoogleUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Check for google@gmail.com with different approaches
    console.log('\n🔍 Checking for google@gmail.com:');
    
    // Method 1: Exact match
    const user1 = await User.findOne({ email: 'google@gmail.com' }).populate('role').select('+password');
    console.log('Method 1 - Exact match:', user1 ? 'Found' : 'Not Found');
    
    // Method 2: Case insensitive
    const user2 = await User.findOne({ 
      email: { $regex: new RegExp('^google@gmail.com$', 'i') } 
    }).populate('role').select('+password');
    console.log('Method 2 - Case insensitive:', user2 ? 'Found' : 'Not Found');
    
    // Method 3: List all users with google in email
    const users3 = await User.find({ 
      email: { $regex: 'google', $options: 'i' } 
    }).populate('role').select('+password');
    console.log('Method 3 - Contains google:', users3.length, 'found');
    users3.forEach(user => {
      console.log(`  - ${user.email} (Name: ${user.name}, Role: ${user.role.name})`);
    });

    // If found, test password
    if (user1) {
      console.log('\n🔑 Testing passwords for google@gmail.com:');
      const testPasswords = ['password', 'admin123', 'faculty123', 'student123'];
      for (const pwd of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(pwd, user1.password);
          console.log(`   "${pwd}": ${isMatch ? '✅ Match' : '❌ No Match'}`);
        } catch (err) {
          console.log(`   "${pwd}": ❌ Error - ${err.message}`);
        }
      }
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkGoogleUser();
