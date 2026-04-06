const mongoose = require('mongoose');
require('dotenv').config();

async function checkAtlasPassword() {
  try {
    console.log('🌐 Checking MongoDB Atlas Database');
    console.log('==================================');
    
    // Use the actual Atlas connection from .env
    const mongoUrl = process.env.MONGO_URL;
    console.log('📡 Connecting to Atlas...');
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get the users collection from Atlas
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('\n🔍 Searching for google@gmail.com in Atlas...');
    
    // Find the user in Atlas
    const userDoc = await usersCollection.findOne({ email: 'google@gmail.com' });
    
    if (userDoc) {
      console.log('✅ User found in Atlas!');
      console.log('\n📋 User Details from Atlas:');
      console.log('   _id: [HIDDEN]');
      console.log('   name:', userDoc.name);
      console.log('   email:', userDoc.email);
      console.log('   password type:', typeof userDoc.password);
      console.log('   password value: [HIDDEN]');
      console.log('   password length:', userDoc.password ? userDoc.password.length : 0);
      console.log('   is null:', userDoc.password === null);
      console.log('   is undefined:', userDoc.password === undefined);
      console.log('   is "password":', userDoc.password === 'password');
      
      // Check if it's hashed
      if (userDoc.password) {
        console.log('   starts with $2a:', userDoc.password.startsWith('$2a'));
        console.log('   starts with $2b:', userDoc.password.startsWith('$2b'));
        console.log('   is bcrypt hash:', userDoc.password.startsWith('$2'));
      }
      
      console.log('\n📄 Complete Document (Password Hidden):');
      const safeDoc = { ...userDoc };
      if (safeDoc.password) safeDoc.password = '[HIDDEN]';
      console.log(JSON.stringify(safeDoc, null, 2));
    } else {
      console.log('❌ User not found in Atlas');
      
      // Show all users in Atlas
      console.log('\n👥 All users in Atlas:');
      const allUsers = await usersCollection.find({}).toArray();
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Password: ${user.password ? '[HIDDEN]' : 'NULL'}`);
        console.log(`   Type: ${typeof user.password}`);
        console.log('');
      });
    }
    
    console.log('\n💡 MongoDB Atlas Compass Connection:');
    console.log('1. Open MongoDB Compass');
    console.log('2. New Connection');
    console.log('3. Connection String:', mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    console.log('4. Database: academicDB');
    console.log('5. Collection: users');
    console.log('6. Filter: {email: "google@gmail.com"}');
    console.log('7. Check password field');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

checkAtlasPassword();
