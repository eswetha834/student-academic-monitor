const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateGoogleUserPlain() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URL);
    console.log('🌐 Connected to MongoDB Atlas');

    // Update google user to plain text role
    const email = 'google@gmail.com';
    const plainPassword = 'password';
    const plainRole = 'student';

    console.log('\n🔄 Updating google user with PLAIN TEXT role:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: "${plainPassword}" (PLAIN TEXT)`);
    console.log(`   Role: "${plainRole}" (PLAIN TEXT - NO ObjectId)`);

    // Find and update user
    const user = await User.findOne({ email });
    if (user) {
      user.password = plainPassword; // Plain text password
      user.role = plainRole; // Plain text role
      user.name = 'Google User';
      user.department = 'Computer Science';
      user.semester = '4';
      user.rollNumber = 'GOO001';
      
      await user.save();
      console.log('✅ Google user updated with plain text role and password');
    } else {
      console.log('❌ Google user not found');
    }

    // Verify the update
    const verifyUser = await User.findOne({ email }).select('+password');
    console.log('\n🔍 Verification:');
    console.log(`   Stored password: "${verifyUser.password}"`);
    console.log(`   Stored role: "${verifyUser.role}"`);
    console.log(`   Password type: ${typeof verifyUser.password}`);
    console.log(`   Role type: ${typeof verifyUser.role}`);
    console.log(`   Is plain password: ${!verifyUser.password.startsWith('$2') ? '✅ Yes' : '❌ No'}`);
    console.log(`   Is plain role: ${typeof verifyUser.role === 'string' ? '✅ Yes' : '❌ No'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

updateGoogleUserPlain();
