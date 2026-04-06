const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseData() {
  try {
    console.log('🔍 Direct Database Check');
    console.log('========================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check collections directly
    console.log('\n📊 Available Collections:');
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    // Check users collection
    console.log('\n👤 Checking Users Collection:');
    try {
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log(`✅ Total users in database: ${userCount}`);
      
      if (userCount > 0) {
        // Get sample users
        const sampleUsers = await usersCollection.find({}).limit(10).toArray();
        
        const students = sampleUsers.filter(u => u.role === 'student');
        const faculty = sampleUsers.filter(u => u.role === 'faculty');
        const teachers = sampleUsers.filter(u => u.role === 'teacher');
        const admins = sampleUsers.filter(u => u.role === 'admin');
        
        console.log(`\n📋 Sample Users by Role:`);
        console.log(`   👨‍🎓 Students: ${students.length}`);
        console.log(`   👨‍🏫 Faculty: ${faculty.length}`);
        console.log(`   👨‍🏫 Teachers: ${teachers.length}`);
        console.log(`   👑 Admins: ${admins.length}`);
        
        if (students.length > 0) {
          console.log(`\n🎓 Sample Students:`);
          students.slice(0, 3).forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.name} (${student.email})`);
          });
        }
        
        if ((faculty.length + teachers.length + admins.length) > 0) {
          console.log(`\n👨‍🏫 Sample Teachers/Faculty/Admins:`);
          const allTeachers = [...faculty, ...teachers, ...admins];
          allTeachers.slice(0, 3).forEach((teacher, index) => {
            console.log(`   ${index + 1}. ${teacher.name} (${teacher.email}) - Role: ${teacher.role}`);
          });
        }
      } else {
        console.log('❌ No users found in database!');
        console.log('🔧 Solution: Create some users first');
      }
      
    } catch (error) {
      console.log('❌ Error accessing users collection:', error.message);
    }
    
    // Check assignments collection
    console.log('\n📝 Checking Assignments Collection:');
    try {
      const assignmentsCollection = db.collection('studentteacherassignments');
      const assignmentCount = await assignmentsCollection.countDocuments();
      console.log(`✅ Total assignments: ${assignmentCount}`);
      
      if (assignmentCount > 0) {
        const sampleAssignments = await assignmentsCollection.find({}).limit(3).toArray();
        console.log('📋 Sample Assignments:');
        sampleAssignments.forEach((assignment, index) => {
          console.log(`   ${index + 1}. ${assignment.studentEmail} → ${assignment.teacherEmail}`);
        });
      }
    } catch (error) {
      console.log('❌ Error accessing assignments collection:', error.message);
    }
    
    console.log('\n🎯 Database Status:');
    console.log('==================');
    if (userCount > 0) {
      console.log('✅ Database has users - Assignment system should work');
      console.log('✅ Check admin dashboard for dropdowns');
    } else {
      console.log('❌ No users in database');
      console.log('🔧 Need to create users first');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabaseData();
