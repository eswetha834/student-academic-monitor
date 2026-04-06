const mongoose = require('mongoose');
require('dotenv').config();

async function fixIsActiveField() {
  try {
    console.log('🔧 Adding isActive Field to All Users');
    console.log('===================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Add isActive field to all users
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with isActive field`);
    
    // If no users were updated (field doesn't exist), add it to all
    if (result.modifiedCount === 0) {
      console.log('🔄 isActive field doesn\'t exist, adding to all users...');
      const addResult = await usersCollection.updateMany(
        {},
        { $set: { isActive: true } }
      );
      console.log(`✅ Added isActive field to ${addResult.modifiedCount} users`);
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying Fix:');
    console.log('===================');
    
    const activeUsers = await usersCollection.find({ isActive: true }).toArray();
    const inactiveUsers = await usersCollection.find({ isActive: false }).toArray();
    const allUsers = await usersCollection.find({}).toArray();
    
    console.log(`✅ Active users: ${activeUsers.length}`);
    console.log(`✅ Inactive users: ${inactiveUsers.length}`);
    console.log(`✅ Total users: ${allUsers.length}`);
    
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
    
    console.log('\n🎉 Success! isActive field fixed');
    console.log('🚀 Assignment system should now work correctly');
    
    console.log('\n📋 Next Steps:');
    console.log('================');
    console.log('1. Refresh admin dashboard');
    console.log('2. Navigate to Assignments tab');
    console.log('3. Check dropdowns - should now show all users');
    console.log('4. Test assignment creation');
    console.log('5. Verify both assignment types work');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixIsActiveField();
