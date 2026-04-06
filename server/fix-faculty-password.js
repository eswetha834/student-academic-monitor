// Fix faculty user password
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    const email = 'faculty@test.com';
    const password = 'faculty123';
    
    console.log(`🔧 Fixing password for: ${email}`);
    
    // Find user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password
    await User.updateOne(
      { email: email },
      { password: hashedPassword }
    );
    
    console.log('✅ Password updated successfully');
    
    // Test the new password
    const updatedUser = await User.findOne({ email: email }).select('+password');
    const isMatch = await bcrypt.compare(password, updatedUser.password);
    console.log('🔓 Password test result:', isMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixPassword();
