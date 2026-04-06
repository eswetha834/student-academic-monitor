// Final test to check faculty user
const mongoose = require('mongoose');
const User = require('./models/User');

async function finalTest() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('✅ Connected to MongoDB');
    
    // Create faculty user if not exists
    const existing = await User.findOne({ email: 'faculty@test.com' });
    if (!existing) {
      console.log('🔧 Creating faculty user...');
      const faculty = new User({
        name: 'Test Faculty',
        email: 'faculty@test.com',
        password: 'faculty123',
        role: 'teacher',
        department: 'Computer Science',
        userIdString: 'faculty_001'
      });
      await faculty.save();
      console.log('✅ Faculty user created');
    }
    
    // Verify user exists
    const user = await User.findOne({ email: 'faculty@test.com' });
    console.log('👤 User:', user ? user.name : 'Not found');
    
    // Test password
    if (user) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('faculty123', user.password);
      console.log('🔓 Password test:', isMatch ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('🎯 Ready to test login in browser');
    console.log('📱 Login: faculty@test.com / faculty123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

finalTest();
