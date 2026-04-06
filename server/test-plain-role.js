const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testPlainRole() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URL);
    console.log('🌐 Connected to MongoDB Atlas');

    // Create new user with plain role
    const email = 'plainrole@gmail.com';
    const plainPassword = 'role123';
    const name = 'Plain Role User';
    const plainRole = 'admin'; // Plain text role

    console.log('\n🆕 Creating user with PLAIN TEXT role:');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Password: "${plainPassword}" (PLAIN TEXT)`);
    console.log(`   Role: "${plainRole}" (PLAIN TEXT - NO ObjectId)`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n⚠️  User already exists. Updating...');
      existingUser.password = plainPassword;
      existingUser.name = name;
      existingUser.role = plainRole; // Plain text role
      existingUser.department = 'Computer Science';
      existingUser.semester = '4';
      existingUser.rollNumber = 'PLAIN001';
      
      await existingUser.save();
      console.log('✅ User updated with plain role');
    } else {
      console.log('\n🆕 Creating new user...');
      
      // Create new user with plain role
      const user = new User({
        name: name,
        email: email,
        password: plainPassword,
        role: plainRole, // Plain text role - no ObjectId
        department: 'Computer Science',
        semester: '4',
        rollNumber: 'PLAIN001'
      });

      await user.save();
      console.log('✅ User created with plain role');
    }

    // Verify the stored role
    const verifyUser = await User.findOne({ email }).select('+password');
    console.log('\n🔍 Verification:');
    console.log(`   Stored password: "${verifyUser.password}"`);
    console.log(`   Stored role: "${verifyUser.role}"`);
    console.log(`   Role type: ${typeof verifyUser.role}`);
    console.log(`   Is ObjectId: ${verifyUser.role && typeof verifyUser.role.toString === 'object' ? 'Yes' : 'No'}`);
    console.log(`   Is string: ${typeof verifyUser.role === 'string' ? '✅ Yes' : '❌ No'}`);

    // Test login
    console.log('\n🧪 Testing login with plain role...');
    const loginMatch = (plainPassword === verifyUser.password);
    console.log(`   Password match: ${loginMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Role check: ${verifyUser.role === plainRole ? '✅ SUCCESS' : '❌ FAILED'}`);

    // Show all users with their roles
    console.log('\n👥 All users with roles:');
    const allUsers = await User.find({}).select('email role password');
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: "${user.role}" (${typeof user.role})`);
      console.log(`   Password: ${user.password ? '"' + user.password + '"' : 'NULL'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

testPlainRole();
