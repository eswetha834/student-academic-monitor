const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function storePlainPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔌 Connected to MongoDB');

    // Get student role
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      console.log('❌ Student role not found');
      process.exit(0);
    }

    // User details
    const email = 'google@gmail.com';
    const plainPassword = 'password'; // Store exactly as provided
    const name = 'Google User';

    console.log('\n📝 Storing user with plain password:');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Password: "${plainPassword}" (PLAIN TEXT)`);
    console.log(`   Role: student`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n⚠️  User already exists. Updating password to plain text...');
      
      // Update existing user with plain password
      existingUser.password = plainPassword; // Store as plain text
      existingUser.role = studentRole._id;
      existingUser.department = 'Computer Science';
      existingUser.semester = '4';
      existingUser.rollNumber = 'GOO001';
      
      await existingUser.save();
      console.log('✅ User updated with plain password');
    } else {
      console.log('\n🆕 Creating new user with plain password...');
      
      // Create new user with plain password
      const user = new User({
        name: name,
        email: email,
        password: plainPassword, // Store as plain text (not hashed)
        role: studentRole._id,
        department: 'Computer Science',
        semester: '4',
        rollNumber: 'GOO001'
      });

      await user.save();
      console.log('✅ User created with plain password');
    }

    // Verify the stored password
    const verifyUser = await User.findOne({ email }).select('+password');
    console.log('\n🔍 Verification:');
    console.log(`   Stored password: "${verifyUser.password}"`);
    console.log(`   Is hashed: ${verifyUser.password.startsWith('$2') ? 'Yes' : 'No (Plain Text)'}`);
    console.log(`   Length: ${verifyUser.password.length} characters`);

    // Test login with plain password comparison
    const isDirectMatch = verifyUser.password === plainPassword;
    console.log(`   Direct match: ${isDirectMatch ? '✅ Yes' : '❌ No'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

storePlainPassword();
