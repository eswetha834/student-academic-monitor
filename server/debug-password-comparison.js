const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function debugPasswordComparison() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔐 Testing Password Comparison');

    // Get user with password field
    const user = await User.findOne({ email: 'google@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📋 User Details:');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Password Hash Length: ${user.password ? user.password.length : 0}`);
    console.log(`Password Hash: ${user.password ? user.password.substring(0, 30) + '...' : 'Missing'}`);

    // Test multiple password scenarios
    const testPasswords = [
      'password',      // Expected correct password
      'Password',      // Case variation
      'PASSWORD',      // All caps
      'passwor',       // Missing character
      'password ',      // With space
      ' password',      // Leading space
      '123456',        // Wrong password
      '',               // Empty
      user.password      // Direct hash comparison (should fail)
    ];

    console.log('\n🔑 Testing Password Comparisons:');
    
    for (const pwd of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(pwd, user.password);
        console.log(`"${pwd}" -> ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      } catch (error) {
        console.log(`"${pwd}" -> ❌ ERROR: ${error.message}`);
      }
    }

    // Test bcrypt functionality
    console.log('\n🔧 Testing Bcrypt Functionality:');
    
    // Test creating new hash
    const testPassword = 'test123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(testPassword, salt);
    
    console.log(`Test password: "${testPassword}"`);
    console.log(`Generated hash: ${hash.substring(0, 30)}...`);
    
    // Test comparing with correct password
    const correctCompare = await bcrypt.compare(testPassword, hash);
    console.log(`Correct comparison: ${correctCompare ? '✅ WORKING' : '❌ BROKEN'}`);
    
    // Test comparing with wrong password
    const wrongCompare = await bcrypt.compare('wrong123', hash);
    console.log(`Wrong comparison: ${wrongCompare ? '❌ BROKEN' : '✅ WORKING'}`);

  } catch (error) {
    console.error('❌ Password Test Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

debugPasswordComparison();
