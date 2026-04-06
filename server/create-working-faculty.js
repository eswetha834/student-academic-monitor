// Create a working faculty user
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createWorkingFaculty() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Delete existing faculty user
    await User.deleteOne({ email: 'faculty@test.com' });
    console.log('🗑️ Deleted existing faculty user');

    // Create a working hash
    const password = 'faculty123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('🔐 Created hash:', hashedPassword);
    
    // Test the hash immediately
    const testResult = await bcrypt.compare(password, hashedPassword);
    console.log('🔓 Hash test result:', testResult ? 'SUCCESS' : 'FAILED');
    
    if (!testResult) {
      console.log('❌ Hash test failed, aborting');
      return;
    }
    
    // Create user with working hash
    const faculty = new User({
      name: 'Test Faculty',
      email: 'faculty@test.com',
      password: hashedPassword,
      role: 'teacher',
      department: 'Computer Science',
      userIdString: 'faculty_001'
    });
    
    await faculty.save();
    console.log('✅ Faculty user created with working hash');
    
    // Verify the user can login
    const verifyUser = await User.findOne({ email: 'faculty@test.com' }).select('+password');
    const loginTest = await bcrypt.compare(password, verifyUser.password);
    console.log('🔓 Final login test:', loginTest ? 'SUCCESS' : 'FAILED');
    
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

createWorkingFaculty();
