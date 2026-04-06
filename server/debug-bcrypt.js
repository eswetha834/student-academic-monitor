// Debug bcrypt comparison issue
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugBcrypt() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'faculty@test.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.name);
    console.log('🔐 Password hash:', user.password);
    console.log('🔐 Hash length:', user.password.length);
    console.log('🔐 Hash starts with $2b:', user.password.startsWith('$2b'));
    
    // Test with different passwords
    const testPasswords = ['faculty123', 'faculty123 ', ' faculty123', 'FACULTY123'];
    
    for (const testPass of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(testPass, user.password);
        console.log(`🔓 Testing "${testPass}": ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        console.log(`🔓 Testing "${testPass}": ERROR - ${error.message}`);
      }
    }
    
    // Test direct comparison
    console.log('🔓 Direct comparison:', user.password === 'faculty123');
    
    // Try creating a new hash and testing
    const newHash = await bcrypt.hash('faculty123', 10);
    console.log('🔐 New hash:', newHash);
    const newMatch = await bcrypt.compare('faculty123', newHash);
    console.log('🔓 New hash test:', newMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugBcrypt();
