// Check existing users and test login with one that works
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkExistingUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Try to login with existing user
    const testUser = users.find(u => u.role === 'teacher');
    if (testUser) {
      console.log(`\n🧪 Testing login with: ${testUser.email}`);
      
      // Test password comparison
      if (testUser.password) {
        const isMatch = await bcrypt.compare('faculty123', testUser.password);
        console.log(`🔓 Password test with 'faculty123': ${isMatch ? 'SUCCESS' : 'FAILED'}`);
        
        // Try common passwords
        const commonPasswords = ['teacher123', 'admin123', 'password', '123456'];
        for (const pass of commonPasswords) {
          const match = await bcrypt.compare(pass, testUser.password);
          if (match) {
            console.log(`🎉 Found working password: ${pass}`);
            console.log(`📱 Login: ${testUser.email} / ${pass}`);
            break;
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkExistingUsers();
