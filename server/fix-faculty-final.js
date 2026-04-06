// Fix faculty user password once and for all
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixFacultyFinal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Delete and recreate faculty user
    await User.deleteOne({ email: 'faculty@test.com' });
    console.log('🗑️ Deleted existing faculty user');

    // Hash password correctly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('faculty123', salt);
    
    console.log('🔐 Generated hash:', hashedPassword.substring(0, 30) + '...');
    
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
    const verifyUser = await User.findOne({ email: 'faculty@test.com' }).select('+password');
    console.log('🔍 Verification:', verifyUser ? verifyUser.name : 'Not found');
    console.log('🔐 Password exists:', !!verifyUser.password);
    
    // Test password
    const isMatch = await bcrypt.compare('faculty123', verifyUser.password);
    console.log('🔓 Password test:', isMatch ? 'SUCCESS' : 'FAILED');
    
    if (isMatch) {
      console.log('🎉 Faculty user is ready for login!');
      console.log('📱 Credentials: faculty@test.com / faculty123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixFacultyFinal();
