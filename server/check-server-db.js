// Check what database the server is connected to
const mongoose = require('mongoose');

async function checkServerDB() {
  try {
    // Connect the same way the server does
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/academic_monitor");
    console.log('✅ Connected to MongoDB');
    console.log('🗄️ Database:', mongoose.connection.name);
    console.log('🔗 Connection string:', process.env.MONGO_URL || "mongodb://localhost:27017/academic_monitor");
    
    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Check users
    const User = require('./models/User');
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users in server connection:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkServerDB();
