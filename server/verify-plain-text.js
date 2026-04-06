const mongoose = require('mongoose');
require('dotenv').config();

async function verifyPlainText() {
  try {
    console.log('🔍 Verifying Plain Text Data in MongoDB');
    console.log('======================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check Google user
    console.log('\n👤 Google User:');
    const googleUser = await db.collection('users').findOne({ email: 'google@gmail.com' });
    if (googleUser) {
      console.log('   ✅ Found Google User');
      console.log('   ├─ Name:', googleUser.name);
      console.log('   ├─ Email:', googleUser.email);
      console.log('   ├─ Password:', googleUser.password);
      console.log('   ├─ Role:', googleUser.role);
      console.log('   ├─ ID:', googleUser._id);
      console.log('   └─ Department:', googleUser.department);
    } else {
      console.log('   ❌ Google User not found');
    }
    
    // Check Admin user
    console.log('\n👤 Admin User:');
    const adminUser = await db.collection('users').findOne({ email: 'admin@gmail.com' });
    if (adminUser) {
      console.log('   ✅ Found Admin User');
      console.log('   ├─ Name:', adminUser.name);
      console.log('   ├─ Email:', adminUser.email);
      console.log('   ├─ Password:', adminUser.password);
      console.log('   ├─ Role:', adminUser.role);
      console.log('   ├─ ID:', adminUser._id);
      console.log('   └─ Department:', adminUser.department);
    } else {
      console.log('   ❌ Admin User not found');
    }
    
    // Show all users with plain text passwords
    console.log('\n👥 All Users with Plain Text Passwords:');
    const allUsers = await db.collection('users').find({}).toArray();
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ├─ Password: ${user.password}`);
      console.log(`   ├─ Role: ${user.role}`);
      console.log(`   ├─ ID: ${user._id}`);
      console.log(`   └─ Department: ${user.department || 'N/A'}`);
      console.log('');
    });
    
    // Check if views exist
    console.log('🔍 Checking Views:');
    const collections = await db.listCollections().toArray();
    const views = collections.filter(c => c.type === 'view');
    
    if (views.length > 0) {
      console.log('   ✅ Views found:');
      views.forEach(view => {
        console.log(`   ├─ ${view.name}`);
      });
    } else {
      console.log('   ❌ No views found');
    }
    
    console.log('\n🎯 MongoDB Compass Instructions:');
    console.log('==================================');
    console.log('1. Click on "users" collection in Compass');
    console.log('2. Click the "Filter" bar at the top');
    console.log('3. Enter: {"password": 1, "role": 1, "_id": 1, "name": 1, "email": 1}');
    console.log('4. Press Enter');
    console.log('5. You will see all data including plain text passwords');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run verification
verifyPlainText();
