// Check server database connection status
const mongoose = require('mongoose');

async function checkServerDBConnection() {
  try {
    // Connect exactly as server does
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('✅ Connected to MongoDB');
    console.log('🗄️ Database:', mongoose.connection.name);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    
    // Check if User model is working
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log('👥 User count:', userCount);
    
    // Find faculty user
    const faculty = await User.findOne({ email: 'faculty@test.com' });
    console.log('👨‍🏫 Faculty user:', faculty ? faculty.name : 'Not found');
    
    // List all users
    const allUsers = await User.find({});
    console.log('📋 All users:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkServerDBConnection();
