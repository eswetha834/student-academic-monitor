const mongoose = require('mongoose');
require('dotenv').config();

async function activateUsers() {
  try {
    console.log('🔄 Activating All Users');
    console.log('========================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Update all users to be active
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateMany(
      { isActive: false },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users to active status`);
    
    // Verify the update
    const activeUsers = await usersCollection.find({ isActive: true }).toArray();
    console.log(`✅ Now ${activeUsers.length} users are active`);
    
    // Show active users by role
    const students = activeUsers.filter(u => u.role === 'student');
    const faculty = activeUsers.filter(u => u.role === 'faculty');
    const teachers = activeUsers.filter(u => u.role === 'teacher');
    const admins = activeUsers.filter(u => u.role === 'admin');
    
    console.log('\n📋 Active Users by Role:');
    console.log('========================');
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`👨‍🏫 Faculty: ${faculty.length}`);
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`👑 Admins: ${admins.length}`);
    
    console.log('\n🎓 Active Students for Assignment:');
    console.log('====================================');
    students.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email}) - Roll: ${student.rollNumber || 'N/A'} - Dept: ${student.department || 'N/A'}`);
    });
    
    console.log('\n👨‍🏫 Active Teachers/Faculty/Admins for Assignment:');
    console.log('====================================================');
    const allTeachers = [...faculty, ...teachers, ...admins];
    allTeachers.slice(0, 5).forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} (${teacher.email}) - Role: ${teacher.role}`);
    });
    
    console.log('\n🎉 Success! All users are now active');
    console.log('🚀 Assignment system should now work correctly');
    
    console.log('\n📋 Next Steps:');
    console.log('================');
    console.log('1. Refresh admin dashboard');
    console.log('2. Navigate to Assignments tab');
    console.log('3. Check dropdowns - should now show data');
    console.log('4. Test assignment creation');
    console.log('5. Verify both assignment types work');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the activation
activateUsers();
