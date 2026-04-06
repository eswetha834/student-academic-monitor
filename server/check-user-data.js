const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserData() {
  try {
    console.log('🔍 Checking User Data in Database');
    console.log('===================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check all users
    console.log('\n📊 Checking All Users:');
    const User = mongoose.model('User');
    const allUsers = await User.find({}).select('name email role isActive').sort({ role: 1, name: 1 });
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database!');
      console.log('🔧 Solution: Create some users first');
    } else {
      console.log(`✅ Found ${allUsers.length} users:`);
      
      const students = allUsers.filter(u => u.role === 'student');
      const faculty = allUsers.filter(u => u.role === 'faculty');
      const teachers = allUsers.filter(u => u.role === 'teacher');
      const admins = allUsers.filter(u => u.role === 'admin');
      
      console.log(`\n📋 User Breakdown:`);
      console.log(`   👨‍🎓 Students: ${students.length}`);
      console.log(`   👨‍🏫 Faculty: ${faculty.length}`);
      console.log(`   👨‍🏫 Teachers: ${teachers.length}`);
      console.log(`   👑 Admins: ${admins.length}`);
      
      if (students.length > 0) {
        console.log(`\n🎓 Students Available for Assignment:`);
        students.slice(0, 5).forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.name} (${student.email})`);
        });
        if (students.length > 5) {
          console.log(`   ... and ${students.length - 5} more students`);
        }
      }
      
      if ((faculty.length + teachers.length + admins.length) > 0) {
        console.log(`\n👨‍🏫 Teachers Available for Assignment:`);
        const allTeachers = [...faculty, ...teachers, ...admins];
        allTeachers.slice(0, 5).forEach((teacher, index) => {
          console.log(`   ${index + 1}. ${teacher.name} (${teacher.email}) - Role: ${teacher.role}`);
        });
        if (allTeachers.length > 5) {
          console.log(`   ... and ${allTeachers.length - 5} more teachers`);
        }
      }
    }
    
    // Check if StudentTeacherAssignment collection exists
    console.log('\n📝 Checking Assignment Collection:');
    try {
      const StudentTeacherAssignment = mongoose.model('StudentTeacherAssignment');
      const assignments = await StudentTeacherAssignment.find({});
      console.log(`✅ Found ${assignments.length} assignments`);
      
      if (assignments.length > 0) {
        console.log('📋 Recent Assignments:');
        assignments.slice(0, 3).forEach((assignment, index) => {
          console.log(`   ${index + 1}. ${assignment.studentEmail} → ${assignment.teacherEmail}`);
        });
      }
    } catch (error) {
      console.log('❌ StudentTeacherAssignment model not found:', error.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log('============');
    if (allUsers.length === 0) {
      console.log('❌ No users in database - Need to create users first');
    } else if (students.length === 0) {
      console.log('❌ No students available - Need to create students first');
    } else if ((faculty.length + teachers.length + admins.length) === 0) {
      console.log('❌ No teachers available - Need to create teachers first');
    } else {
      console.log('✅ Users available for assignment management');
      console.log('✅ Assignment system should work correctly');
      console.log('✅ Check admin dashboard for dropdowns');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkUserData();
