const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkMongoDBPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔌 Connected to MongoDB');

    // Find the user and show exact password
    const user = await User.findOne({ email: 'google@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📋 User Details:');
    console.log('   ID:', user._id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Password Field:');
    console.log('     - Type:', typeof user.password);
    console.log('     - Value:', user.password);
    console.log('     - Length:', user.password ? user.password.length : 0);
    console.log('     - Is Null:', user.password === null);
    console.log('     - Is Undefined:', user.password === undefined);
    console.log('     - Is Empty String:', user.password === '');
    console.log('     - Starts with $2a (bcrypt):', user.password ? user.password.startsWith('$2a') : 'N/A');
    console.log('     - Starts with $2b (bcrypt):', user.password ? user.password.startsWith('$2b') : 'N/A');
    console.log('     - Is "password":', user.password === 'password');
    console.log('     - Contains "password":', user.password ? user.password.includes('password') : 'N/A');

    // Check all users to see what's stored
    console.log('\n👥 All Users with Password Status:');
    const allUsers = await User.find({}).select('email password');
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Password: ${user.password ? '"' + user.password + '"' : 'NULL/MISSING'}`);
      console.log(`   Type: ${typeof user.password}`);
      console.log(`   Length: ${user.password ? user.password.length : 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkMongoDBPassword();
