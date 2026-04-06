// Check what's actually in the server's database
const mongoose = require('mongoose');

async function checkServerActual() {
  try {
    // Connect to the same database as server
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');
    
    // Check raw collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    const allUsers = await collection.find({}).toArray();
    console.log(`👥 Found ${allUsers.length} users in database:`);
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    // Check specifically for faculty
    const faculty = await collection.findOne({ email: 'faculty@test.com' });
    console.log('👨‍🏫 Faculty in raw collection:', faculty ? faculty.name : 'Not found');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkServerActual();
