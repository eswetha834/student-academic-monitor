const mongoose = require('mongoose');
require('dotenv').config();

async function testStats() {
  try {
    console.log('📊 Testing Admin Stats Fix');
    console.log('==============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test the fixed query directly
    console.log('\n🔍 Testing Fixed Student Count:');
    const usersCollection = db.collection('users');
    
    // Count students with role string (fixed method)
    const studentCount = await usersCollection.countDocuments({ role: 'student' });
    console.log(`✅ Students with role 'student': ${studentCount}`);
    
    // Count teachers with role array (fixed method)
    const teacherCount = await usersCollection.countDocuments({ 
      role: { $in: ['faculty', 'teacher', 'admin'] }
    });
    console.log(`✅ Teachers with role array: ${teacherCount}`);
    
    // Test with active filter
    const activeStudentCount = await usersCollection.countDocuments({ 
      role: 'student',
      isActive: true 
    });
    console.log(`✅ Active students: ${activeStudentCount}`);
    
    console.log('\n🎯 Results:');
    console.log('=============');
    if (studentCount > 0) {
      console.log('✅ Student count should now work in admin stats');
      console.log('✅ Admin dashboard should show correct student count');
    } else {
      console.log('❌ Still showing 0 students');
    }
    
    console.log('\n💡 Expected in Admin Dashboard:');
    console.log('=================================');
    console.log(`Total Students Enrolled: ${studentCount}`);
    console.log(`Total Teachers: ${teacherCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testStats();
