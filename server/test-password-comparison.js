const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testPasswordComparison() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    
    // Test admin password comparison
    const admin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    if (admin) {
      console.log('Testing admin password comparison:');
      console.log('Stored hash:', admin.password);
      console.log('Hash starts with $2:', admin.password.startsWith('$2'));
      
      const testPassword = 'admin123';
      console.log(`Testing password: "${testPassword}"`);
      
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log(`Password match result: ${isMatch}`);
      
      if (!isMatch) {
        console.log('❌ Password comparison failed - this is the issue!');
        
        // Try to hash the test password and compare
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('New hash would be:', newHash);
        
        // Update the admin password with correct hash
        console.log('Updating admin password...');
        admin.password = newHash;
        await admin.save();
        console.log('✅ Admin password updated');
        
        // Test again
        const updatedAdmin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
        const newMatch = await bcrypt.compare(testPassword, updatedAdmin.password);
        console.log(`After update - Password match: ${newMatch}`);
      } else {
        console.log('✅ Password comparison works - issue is elsewhere');
      }
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testPasswordComparison();
