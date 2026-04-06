// Create faculty user with plain password (let the hook hash it)
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createFacultyPlain() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Delete existing faculty user
    await User.deleteOne({ email: 'faculty@test.com' });
    console.log('🗑️ Deleted existing faculty user');

    // Create user with plain password (hook will hash it)
    const faculty = new User({
      name: 'Test Faculty',
      email: 'faculty@test.com',
      password: 'faculty123', // Plain password - hook will hash it
      role: 'teacher',
      department: 'Computer Science',
      userIdString: 'faculty_001'
    });
    
    await faculty.save();
    console.log('✅ Faculty user created (hook hashed password)');
    
    // Verify the user can login
    const verifyUser = await User.findOne({ email: 'faculty@test.com' }).select('+password');
    console.log('🔐 Password exists:', !!verifyUser.password);
    console.log('🔐 Hash length:', verifyUser.password.length);
    
    const loginTest = await bcrypt.compare('faculty123', verifyUser.password);
    console.log('🔓 Login test:', loginTest ? 'SUCCESS' : 'FAILED');
    
    if (loginTest) {
      console.log('🎉 Faculty user is ready!');
      console.log('📱 Login: faculty@test.com / faculty123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createFacultyPlain();
