const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugUserExists() {
  try {
    // Test database connection
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('✅ Database connected successfully');

    // Test different email variations to find exact match issues
    const testEmails = [
      'google@gmail.com',
      'Google@gmail.com', 
      'GOOGLE@gmail.com',
      'google@gmail.com ',
      ' google@gmail.com',
      'google @gmail.com'
    ];

    console.log('\n🔍 Testing user existence with different email variations:');
    
    for (const email of testEmails) {
      const user = await User.findOne({ email: email });
      console.log(`"${email}" -> ${user ? '✅ Found' : '❌ Not Found'}`);
      
      if (user) {
        console.log(`   User ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email in DB: "${user.email}"`);
        console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log(`   Role: ${user.role || 'Not set'}`);
      }
    }

    // Test with exact match (case-sensitive)
    const exactUser = await User.findOne({ email: { $eq: 'google@gmail.com' } });
    console.log('\n🎯 Exact match test:');
    console.log(`Exact "google@gmail.com" -> ${exactUser ? '✅ Found' : '❌ Not Found'}`);

    // Test with case-insensitive regex
    const regexUser = await User.findOne({ 
      email: { $regex: new RegExp('^google@gmail.com$', 'i') } 
    });
    console.log(`Case-insensitive regex -> ${regexUser ? '✅ Found' : '❌ Not Found'}`);

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

debugUserExists();
