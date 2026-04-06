const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function createPlainUser() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URL);
    console.log('🌐 Connected to MongoDB Atlas');

    // Get student role
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      console.log('❌ Student role not found');
      process.exit(0);
    }

    // Create new user with plain password
    const email = 'testuser@gmail.com';
    const plainPassword = 'test123'; // Plain text password
    const name = 'Test User';

    console.log('\n🆕 Creating new user with PLAIN TEXT password:');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Password: "${plainPassword}" (PLAIN TEXT - NO HASHING)`);
    console.log(`   Role: student`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n⚠️  User already exists. Updating...');
      existingUser.password = plainPassword; // Plain text
      existingUser.name = name;
      existingUser.role = studentRole._id;
      existingUser.department = 'Computer Science';
      existingUser.semester = '4';
      existingUser.rollNumber = 'TEST001';
      
      await existingUser.save();
      console.log('✅ User updated with plain password');
    } else {
      console.log('\n🆕 Creating new user...');
      
      // Create new user with plain password
      const user = new User({
        name: name,
        email: email,
        password: plainPassword, // Plain text - NO HASHING
        role: studentRole._id,
        department: 'Computer Science',
        semester: '4',
        rollNumber: 'TEST001'
      });

      await user.save();
      console.log('✅ User created with plain password');
    }

    // Verify the stored password
    const verifyUser = await User.findOne({ email }).select('+password');
    console.log('\n🔍 Verification:');
    console.log(`   Stored password: "${verifyUser.password}"`);
    console.log(`   Is plain text: ${!verifyUser.password.startsWith('$2') ? '✅ Yes' : '❌ No'}`);
    console.log(`   Length: ${verifyUser.password.length} characters`);
    console.log(`   Exact match: ${verifyUser.password === plainPassword ? '✅ Yes' : '❌ No'}`);

    // Test login
    console.log('\n🧪 Testing login with plain password...');
    const loginMatch = (plainPassword === verifyUser.password);
    console.log(`   Login test: ${loginMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

createPlainUser();
