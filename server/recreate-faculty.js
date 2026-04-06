// Recreate the faculty user
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function recreateFaculty() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Delete existing faculty user if exists
    await User.deleteOne({ email: 'faculty@test.com' });
    console.log('🗑️ Deleted existing faculty user');

    // Create new faculty user
    const hashedPassword = await bcrypt.hash('faculty123', 10);
    
    const faculty = new User({
      name: 'Test Faculty',
      email: 'faculty@test.com',
      password: hashedPassword,
      role: 'teacher',
      department: 'Computer Science',
      userIdString: 'faculty_001'
    });
    
    await faculty.save();
    console.log('✅ Faculty user created successfully');
    
    // Verify the user
    const verifyUser = await User.findOne({ email: 'faculty@test.com' });
    console.log('🔍 Verification:', verifyUser ? verifyUser.name : 'Not found');
    
    // Test password
    const isMatch = await bcrypt.compare('faculty123', verifyUser.password);
    console.log('🔓 Password test:', isMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

recreateFaculty();
