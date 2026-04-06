const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkSRUUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find the SRU user
    const sruUser = await User.findOne({ email: 'sru@gmail.com' });
    
    if (sruUser) {
      console.log('✅ Found SRU user:');
      console.log('📧 Email:', sruUser.email);
      console.log('👤 Name:', sruUser.name);
      console.log('🎓 Role:', sruUser.role);
      console.log('📚 Department:', sruUser.department || 'Not set');
      console.log('🔢 Roll Number:', sruUser.rollNumber || 'Not set');
      console.log('📖 Semester:', sruUser.semester || 'Not set');
      console.log('🆔 User ID:', sruUser._id);
      console.log('📅 Created:', sruUser.createdAt);
      console.log('✅ Active:', sruUser.isActive);
      
      // Test password comparison
      const passwordMatch = await sruUser.comparePassword('sru123');
      console.log('🔑 Password "sru123" matches:', passwordMatch ? '✅ Yes' : '❌ No');
      
    } else {
      console.log('❌ SRU user not found');
    }

  } catch (error) {
    console.error('❌ Error checking SRU user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkSRUUser();
