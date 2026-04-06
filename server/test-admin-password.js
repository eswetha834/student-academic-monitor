const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testAdminPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    const admin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    
    if (admin) {
      console.log('Testing passwords:');
      const passwords = ['admin123', 'admin', 'password', '123456'];
      for (const pwd of passwords) {
        const isMatch = await bcrypt.compare(pwd, admin.password);
        console.log(`- '${pwd}': ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      }
      console.log('Stored hash length:', admin.password.length);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAdminPassword();
