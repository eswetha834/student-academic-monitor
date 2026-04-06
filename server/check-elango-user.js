const mongoose = require('mongoose');
require('dotenv').config();

async function checkElangoUser() {
  try {
    console.log('🔍 Checking Elango User Details');
    console.log('===============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Find Elango user
    console.log('\n👤 Searching for elango@gmail.com...');
    const elangoUser = await db.collection('users').findOne({ email: 'elango@gmail.com' });
    
    if (elangoUser) {
      console.log('✅ Elango User Found:');
      console.log('==================');
      console.log(`📧 Email: ${elangoUser.email}`);
      console.log(`👤 Name: ${elangoUser.name}`);
      console.log(`🔐 Password: ${elangoUser.password}`);
      console.log(`🎭 Role: ${elangoUser.role}`);
      console.log(`🆔 ID: ${elangoUser._id}`);
      console.log(`🏢 Department: ${elangoUser.department || 'N/A'}`);
      console.log(`📚 Semester: ${elangoUser.semester || 'N/A'}`);
      console.log(`📝 Roll Number: ${elangoUser.rollNumber || 'N/A'}`);
      
      // Check if password is hashed
      const isHashed = elangoUser.password.startsWith('$2');
      console.log(`🔒 Password Type: ${isHashed ? 'Hashed (bcrypt)' : 'Plain Text'}`);
      
      // Get role name if it's a reference
      if (elangoUser.role && typeof elangoUser.role === 'object') {
        try {
          const roleDoc = await db.collection('roles').findOne({ _id: elangoUser.role });
          if (roleDoc) {
            console.log(`🎭 Role Name: ${roleDoc.name}`);
            console.log(`📝 Role Description: ${roleDoc.description || 'N/A'}`);
          }
        } catch (err) {
          console.log(`🎭 Role: ${elangoUser.role} (reference)`);
        }
      } else {
        console.log(`🎭 Role: ${elangoUser.role} (direct)`);
      }
      
      // Show all fields
      console.log('\n📋 Complete User Data:');
      console.log('====================');
      console.log(JSON.stringify(elangoUser, null, 2));
      
    } else {
      console.log('❌ Elango User Not Found');
      
      // Show similar users
      console.log('\n🔍 Searching for similar users...');
      const similarUsers = await db.collection('users').find({
        $or: [
          { email: { $regex: 'elango', $options: 'i' } },
          { name: { $regex: 'elango', $options: 'i' } }
        ]
      }).toArray();
      
      if (similarUsers.length > 0) {
        console.log('✅ Found similar users:');
        similarUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email})`);
          console.log(`   ├─ Password: ${user.password}`);
          console.log(`   ├─ Role: ${user.role}`);
          console.log(`   └─ ID: ${user._id}`);
        });
      } else {
        console.log('❌ No similar users found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkElangoUser();
