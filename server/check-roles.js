const mongoose = require('mongoose');
require('dotenv').config();

async function checkRoles() {
  try {
    console.log('🔍 Checking Role IDs in Database');
    console.log('==================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check roles collection
    const rolesCollection = db.collection('roles');
    const allRoles = await rolesCollection.find({}).toArray();
    
    console.log('\n📋 All Roles in Database:');
    allRoles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} - ID: ${role._id}`);
    });
    
    // Check student role specifically
    const studentRole = allRoles.find(r => r.name === 'student');
    const facultyRole = allRoles.find(r => r.name === 'faculty');
    const teacherRole = allRoles.find(r => r.name === 'teacher');
    const adminRole = allRoles.find(r => r.name === 'admin');
    
    console.log('\n🎯 Role IDs Found:');
    console.log('==================');
    console.log(`Student Role ID: ${studentRole ? studentRole._id : 'NOT FOUND'}`);
    console.log(`Faculty Role ID: ${facultyRole ? facultyRole._id : 'NOT FOUND'}`);
    console.log(`Teacher Role ID: ${teacherRole ? teacherRole._id : 'NOT FOUND'}`);
    console.log(`Admin Role ID: ${adminRole ? adminRole._id : 'NOT FOUND'}`);
    
    // Test user counts with these role IDs
    console.log('\n📊 Testing User Counts:');
    console.log('========================');
    
    const usersCollection = db.collection('users');
    
    if (studentRole) {
      const studentCount = await usersCollection.countDocuments({ role: studentRole._id });
      console.log(`Students with role ID ${studentRole._id}: ${studentCount}`);
    }
    
    if (facultyRole) {
      const facultyCount = await usersCollection.countDocuments({ role: facultyRole._id });
      console.log(`Faculty with role ID ${facultyRole._id}: ${facultyCount}`);
    }
    
    // Test counting all users who can be students
    const allStudentUsers = await usersCollection.find({ role: 'student' }).toArray();
    console.log(`All users with role string 'student': ${allStudentUsers.length}`);
    
    // Test counting active students
    const activeStudents = await usersCollection.find({ 
      role: studentRole._id,
      isActive: true 
    }).toArray();
    console.log(`Active students with role ID and isActive=true: ${activeStudents.length}`);
    
    console.log('\n💡 Diagnosis:');
    console.log('==============');
    if (studentCount === 0) {
      console.log('❌ Admin stats showing 0 students because:');
      console.log('   - Student role ID lookup failed');
      console.log('   - Or student role ID doesn\'t match user role field');
      console.log('   - Or isActive filter is excluding students');
    } else {
      console.log('✅ Student count should work in admin stats');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkRoles();
