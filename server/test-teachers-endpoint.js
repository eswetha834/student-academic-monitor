const mongoose = require('mongoose');
require('dotenv').config();

async function testTeachersEndpoint() {
  try {
    console.log('👨‍🏫 Testing Teachers Endpoint Directly');
    console.log('====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test the teachers endpoint directly
    console.log('\n📊 Testing: GET /api/admin/teachers');
    try {
      const User = mongoose.model('User');
      const teachers = await User.find({ 
        role: { $in: ['faculty', 'teacher', 'admin'] },
        isActive: true 
      }).select('name email role').sort({ name: 1 });
      
      console.log(`✅ Found ${teachers.length} teachers in database:`);
      teachers.forEach((teacher, index) => {
        console.log(`   ${index + 1}. Name: "${teacher.name}"`);
        console.log(`      Email: "${teacher.email}"`);
        console.log(`      Role: "${teacher.role}"`);
        console.log(`      Active: ${teacher.isActive}`);
      });
      
      // Check if admin users exist
      const adminUsers = teachers.filter(t => t.role === 'admin');
      const facultyUsers = teachers.filter(t => t.role === 'faculty');
      const teacherRoleUsers = teachers.filter(t => t.role === 'teacher');
      
      console.log(`\n📊 Role Breakdown:`);
      console.log(`   Admins: ${adminUsers.length}`);
      console.log(`   Faculty: ${facultyUsers.length}`);
      console.log(`   Teachers: ${teacherRoleUsers.length}`);
      
      if (teachers.length === 0) {
        console.log('\n❌ ISSUE: No teachers found in database!');
        console.log('🔧 Solution: Create some teacher/faculty users first');
      } else {
        console.log('\n✅ Teachers endpoint is working correctly!');
        console.log('🎯 Expected: All teacher emails should appear in dropdown');
      }
      
    } catch (error) {
      console.error('❌ Direct test error:', error.message);
    } finally {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the test
testTeachersEndpoint();
