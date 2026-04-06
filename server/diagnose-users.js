const mongoose = require('mongoose');
require('dotenv').config();

async function diagnoseUsers() {
  try {
    console.log('🔍 Diagnosing User Status');
    console.log('==========================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all users with their isActive status
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();
    
    console.log('\n📊 All Users with Status:');
    console.log('===========================');
    
    allUsers.forEach((user, index) => {
      const activeStatus = user.isActive;
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   isActive: ${activeStatus} (type: ${typeof activeStatus})`);
      console.log(`   isActive value: ${JSON.stringify(activeStatus)}`);
      console.log('---');
    });
    
    // Test different queries
    console.log('\n🔍 Testing Query Filters:');
    console.log('===========================');
    
    const activeUsersQuery = await usersCollection.find({ isActive: true }).toArray();
    console.log(`Query { isActive: true } returns: ${activeUsersQuery.length} users`);
    
    const activeUsersString = await usersCollection.find({ isActive: "true" }).toArray();
    console.log(`Query { isActive: "true" } returns: ${activeUsersString.length} users`);
    
    const noFilter = await usersCollection.find({}).toArray();
    console.log(`Query {} returns: ${noFilter.length} users`);
    
    // Test specific user
    console.log('\n🎯 Testing API Query Logic:');
    console.log('=============================');
    
    // Simulate API query for teachers
    const teacherQuery = { 
      role: { $in: ['faculty', 'teacher', 'admin'] },
      isActive: true 
    };
    const teacherResults = await usersCollection.find(teacherQuery).toArray();
    console.log(`Teacher query ${JSON.stringify(teacherQuery)} returns: ${teacherResults.length} results`);
    
    // Simulate API query for students
    const studentQuery = { 
      role: 'student',
      isActive: true 
    };
    const studentResults = await usersCollection.find(studentQuery).toArray();
    console.log(`Student query ${JSON.stringify(studentQuery)} returns: ${studentResults.length} results`);
    
    console.log('\n💡 Diagnosis:');
    console.log('==============');
    if (teacherResults.length === 0 && studentResults.length === 0) {
      console.log('❌ API queries return 0 results');
      console.log('🔍 Issue: isActive field might be string or boolean mismatch');
      console.log('🔧 Solution: Check isActive field type and values');
    } else {
      console.log('✅ API queries should work');
      console.log('✅ Assignment system should show data');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the diagnosis
diagnoseUsers();
