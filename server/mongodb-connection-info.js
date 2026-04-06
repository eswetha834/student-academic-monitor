const mongoose = require('mongoose');
require('dotenv').config();

async function showMongoDBConnectionInfo() {
  try {
    console.log('🔍 MongoDB Connection Information:');
    console.log('=====================================');
    
    // Show connection string (without password)
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor';
    const cleanUrl = mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('📡 Connection URL:', cleanUrl);
    console.log('🗄️ Database Name:', 'academic-monitor');
    console.log('🏠 Host:', 'localhost');
    console.log('🔌 Port:', '27017');
    
    // Connect and show collections
    await mongoose.connect(mongoUrl);
    console.log('\n📚 Available Collections:');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Show users collection stats
    const usersCollection = db.collection('users');
    const stats = await usersCollection.stats();
    
    console.log('\n📊 Users Collection Stats:');
    console.log('   Document Count:', stats.count);
    console.log('   Average Document Size:', stats.avgObjSize, 'bytes');
    console.log('   Collection Size:', stats.size, 'bytes');
    
    // Show exact document structure
    console.log('\n🔍 Google User Document Structure:');
    const userDoc = await usersCollection.findOne({ email: 'google@gmail.com' });
    
    if (userDoc) {
      console.log('   _id:', userDoc._id);
      console.log('   name:', userDoc.name);
      console.log('   email:', userDoc.email);
      console.log('   password:', userDoc.password);
      console.log('   role:', userDoc.role);
      console.log('   department:', userDoc.department);
      console.log('   semester:', userDoc.semester);
      console.log('   rollNumber:', userDoc.rollNumber);
      
      // Show raw document
      console.log('\n📄 Raw Document (JSON):');
      console.log(JSON.stringify(userDoc, null, 2));
    }
    
    console.log('\n💡 MongoDB Compass Viewing Tips:');
    console.log('1. Connect to: mongodb://localhost:27017');
    console.log('2. Select database: academic-monitor');
    console.log('3. Go to collection: users');
    console.log('4. Find document with email: "google@gmail.com"');
    console.log('5. Check password field - it should show: "password"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

showMongoDBConnectionInfo();
