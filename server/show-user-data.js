const mongoose = require('mongoose');
require('dotenv').config();

async function showUserData() {
  try {
    console.log('🔍 Showing Available User Data');
    console.log('==============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get users collection
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();
    
    console.log('\n📊 All Registered Users:');
    console.log('=========================');
    
    allUsers.forEach((user, index) => {
      const status = user.isActive ? '✅ Active' : '❌ Inactive';
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Status: ${status}`);
    });
    
    // Group by role
    const students = allUsers.filter(u => u.role === 'student');
    const faculty = allUsers.filter(u => u.role === 'faculty');
    const teachers = allUsers.filter(u => u.role === 'teacher');
    const admins = allUsers.filter(u => u.role === 'admin');
    
    console.log('\n📋 Role Summary:');
    console.log('=================');
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`👨‍🏫 Faculty: ${faculty.length}`);
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`👑 Admins: ${admins.length}`);
    
    console.log('\n🎓 Available Students for Assignment:');
    console.log('====================================');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email}) - Roll: ${student.rollNumber || 'N/A'} - Dept: ${student.department || 'N/A'}`);
    });
    
    console.log('\n👨‍🏫 Available Teachers/Faculty/Admins for Assignment:');
    console.log('====================================================');
    const allTeachers = [...faculty, ...teachers, ...admins];
    allTeachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} (${teacher.email}) - Role: ${teacher.role}`);
    });
    
    console.log('\n🎯 Assignment System Status:');
    console.log('==========================');
    if (students.length > 0 && allTeachers.length > 0) {
      console.log('✅ Users available for assignment management');
      console.log('✅ Admin dashboard should show dropdowns with data');
      console.log('✅ Assignment creation should work correctly');
    } else {
      console.log('❌ Missing users for assignment management');
    }
    
    console.log('\n🚀 Ready for Testing!');
    console.log('====================');
    console.log('1. Go to: http://localhost:3000');
    console.log('2. Login as admin');
    console.log('3. Navigate to Assignments tab');
    console.log('4. Check dropdowns for user data');
    console.log('5. Test assignment creation');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
showUserData();
