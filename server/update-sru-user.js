const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateSRUUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find and update the SRU user
    const sruUser = await User.findOne({ email: 'sru@gmail.com' });
    
    if (sruUser) {
      console.log('✅ Found SRU user, updating...');
      
      // Update user details
      sruUser.name = 'SRU Student';
      sruUser.password = 'sru123'; // Will be hashed automatically
      sruUser.plainPassword = 'sru123'; // For reference
      sruUser.department = 'Computer Science';
      sruUser.rollNumber = 'CS2024001';
      sruUser.semester = '4th';
      sruUser.isActive = true;
      
      await sruUser.save();
      console.log('✅ SRU user updated successfully!');
      
      // Verify the update
      const updatedUser = await User.findOne({ email: 'sru@gmail.com' });
      console.log('\n📋 Updated User Details:');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Name:', updatedUser.name);
      console.log('🎓 Role:', updatedUser.role);
      console.log('📚 Department:', updatedUser.department);
      console.log('🔢 Roll Number:', updatedUser.rollNumber);
      console.log('📖 Semester:', updatedUser.semester);
      
      // Test password
      const passwordMatch = await updatedUser.comparePassword('sru123');
      console.log('🔑 Password "sru123" matches:', passwordMatch ? '✅ Yes' : '❌ No');
      
    } else {
      console.log('❌ SRU user not found');
    }

  } catch (error) {
    console.error('❌ Error updating SRU user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updateSRUUser();
