// Check the live database connection and users
const mongoose = require('mongoose');

async function checkLiveDB() {
  try {
    // Connect exactly as the server does
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/academic-monitor");
    console.log('✅ Connected to MongoDB');
    console.log('🗄️ Database name:', mongoose.connection.name);
    
    // Check all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Check users collection directly
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`👥 Found ${allUsers.length} users in raw collection:`);
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check faculty user specifically
    const faculty = await usersCollection.findOne({ email: 'faculty@test.com' });
    console.log('👨‍🏫 Faculty user:', faculty ? faculty.name : 'Not found');
    
    // Check User model
    const User = require('./models/User');
    const modelUser = await User.findOne({ email: 'faculty@test.com' });
    console.log('📦 User model result:', modelUser ? modelUser.name : 'Not found');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkLiveDB();
