const mongoose = require('mongoose');

async function checkDatabaseState() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');
    
    // List all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if users collection exists and count documents
    if (collections.find(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments();
      console.log(`\n👥 Users collection has ${userCount} documents`);
      
      if (userCount > 0) {
        // Get sample documents
        const sampleUsers = await db.collection('users').find({}).limit(3).toArray();
        console.log('\n📋 Sample user documents:');
        sampleUsers.forEach(user => {
          console.log(`- Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
        });
      }
    } else {
      console.log('\n❌ No users collection found');
    }
    
    // Check other relevant collections
    const relevantCollections = ['studentteacherassignments', 'roles', 'assignments'];
    for (const colName of relevantCollections) {
      if (collections.find(c => c.name === colName)) {
        const count = await db.collection(colName).countDocuments();
        console.log(`📊 ${colName}: ${count} documents`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabaseState();
