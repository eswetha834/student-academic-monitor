const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetSRUPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find the SRU user
    const sruUser = await User.findOne({ email: 'sru@gmail.com' });
    
    if (sruUser) {
      console.log('✅ Found SRU user, resetting password...');
      
      // Hash the password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('sru123', salt);
      
      // Update the password directly
      await User.updateOne(
        { email: 'sru@gmail.com' },
        { 
          $set: { 
            password: hashedPassword,
            plainPassword: 'sru123',
            name: 'SRU Student',
            department: 'Computer Science',
            rollNumber: 'CS2024001',
            semester: '4th'
          }
        }
      );
      
      console.log('✅ Password reset successfully!');
      
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
      
      if (passwordMatch) {
        console.log('\n🎉 SRU user is ready for login!');
        console.log('📧 Username: sru@gmail.com');
        console.log('🔑 Password: sru123');
      }
      
    } else {
      console.log('❌ SRU user not found');
    }

  } catch (error) {
    console.error('❌ Error resetting SRU password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

resetSRUPassword();
