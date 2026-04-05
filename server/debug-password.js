const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function debugPasswordComparison() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔐 Testing Password Comparison');

    const testEmail = 'google@gmail.com';
    const testPasswords = ['password', 'admin123', 'faculty123', 'student123', 'wrong'];

    const user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`\n🔑 Testing passwords for: ${testEmail}`);
    console.log(`📝 Stored hash: ${user.password.substring(0, 30)}...`);

    for (const pwd of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(pwd, user.password);
        console.log(`   "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      } catch (error) {
        console.log(`   "${pwd}": ❌ ERROR - ${error.message}`);
      }
    }

    // Test creating a new hash to verify bcrypt is working
    console.log('\n🔧 Testing bcrypt functionality:');
    const testHash = await bcrypt.hash('test123', 10);
    const testVerify = await bcrypt.compare('test123', testHash);
    console.log(`   New hash creation: ✅ ${testHash.substring(0, 30)}...`);
    console.log(`   Hash verification: ${testVerify ? '✅ WORKING' : '❌ BROKEN'}`);

  } catch (error) {
    console.error('❌ Password Test Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugPasswordComparison();
