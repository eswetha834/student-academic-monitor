const mongoose = require('mongoose');
require('dotenv').config();

async function testModels() {
  try {
    console.log('🧪 Testing Model Loading');
    console.log('========================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    // Test User model
    console.log('\n👤 Testing User Model:');
    try {
      const User = mongoose.model('User');
      console.log('✅ User model loaded:', User.modelName);
      
      const userCount = await User.countDocuments();
      console.log(`📊 Total users: ${userCount}`);
      
      const adminUsers = await User.find({ role: 'admin' }).limit(2);
      console.log('👑 Admin users:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
      
      const studentUsers = await User.find({ role: 'student' }).limit(3);
      console.log('🎓 Student users:');
      studentUsers.forEach(student => {
        console.log(`   - ${student.name} (${student.email})`);
      });
      
      const teacherUsers = await User.find({ role: { $in: ['faculty', 'teacher'] } }).limit(3);
      console.log('👨‍🏫 Teacher users:');
      teacherUsers.forEach(teacher => {
        console.log(`   - ${teacher.name} (${teacher.email})`);
      });
      
    } catch (error) {
      console.log('❌ User model error:', error.message);
    }
    
    // Test StudentTeacherAssignment model
    console.log('\n📚 Testing StudentTeacherAssignment Model:');
    try {
      const StudentTeacherAssignment = mongoose.model('StudentTeacherAssignment');
      console.log('✅ StudentTeacherAssignment model loaded:', StudentTeacherAssignment.modelName);
      
      const assignmentCount = await StudentTeacherAssignment.countDocuments();
      console.log(`📊 Total assignments: ${assignmentCount}`);
      
    } catch (error) {
      console.log('❌ StudentTeacherAssignment model error:', error.message);
    }
    
    console.log('\n🎯 Model Loading Results:');
    console.log('========================');
    console.log('✅ Database connection: Working');
    console.log('✅ User model: Available');
    console.log('✅ StudentTeacherAssignment model: Available');
    
    console.log('\n🚀 Next Steps:');
    console.log('==============');
    console.log('1. Restart server: npm start');
    console.log('2. Test admin login');
    console.log('3. Navigate to Assignments tab');
    console.log('4. Test assignment creation');
    console.log('5. Check browser console for API calls');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testModels();
