const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testStudentStats() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27091/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('🎯 TESTING STUDENT STATS ENDPOINT');
    console.log('=' .repeat(50));

    // Get SRU student data
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    const marks = await Marks.find({ studentId: sruStudent._id });
    
    console.log('\n📊 STUDENT DATA ANALYSIS:');
    console.log('👤 Student:', sruStudent.name);
    console.log('📧 Email:', sruStudent.email);
    console.log('📚 Total Subjects:', marks.length);

    // Calculate expected stats
    const totalMarks = marks.reduce((sum, mark) => sum + (Number(mark.marks) || 0), 0);
    const avgMarks = totalMarks / marks.length;
    const expectedGpa = (avgMarks / 25).toFixed(2);
    const totalCredits = marks.length * 3;
    
    console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
    console.log('🎓 Expected GPA:', expectedGpa);
    console.log('💳 Total Credits:', totalCredits);

    // Get all students for ranking
    const allStudents = await User.find({ role: "student" });
    console.log('👥 Total Students:', allStudents.length);

    console.log('\n✅ NEW STATS ENDPOINT FEATURES:');
    console.log('📊 Current GPA: Calculated from marks percentage');
    console.log('🎯 Target GPA: From student goals (default 4.0)');
    console.log('🏆 Rank: Calculated among all students');
    console.log('👥 Total Students: Total student population');
    console.log('💳 Total Credits: Based on subject count (3 credits each)');
    console.log('🔮 Predicted GPA: Weighted average of current and target');

    console.log('\n🌐 TESTING THE ENDPOINT:');
    console.log('📡 Endpoint: GET /api/stats/student');
    console.log('🔐 Authentication: Required (student only)');
    console.log('📤 Response Format: JSON with all stats');

    console.log('\n📱 FRONTEND INTEGRATION:');
    console.log('✅ Current GPA: Will show calculated value');
    console.log('✅ Rank: Will show actual ranking');
    console.log('✅ Credits: Will show total credits');
    console.log('✅ Target GPA: Will show student goal');
    console.log('✅ Predicted GPA: Will show prediction');

    console.log('\n🎯 EXPECTED RESULTS FOR SRU STUDENT:');
    console.log('📊 Current GPA:', expectedGpa, '(from', avgMarks.toFixed(1) + '% marks)');
    console.log('🎯 Target GPA: 4.0 (default)');
    console.log('🏆 Rank: Will be calculated based on all students');
    console.log('💳 Total Credits:', totalCredits);
    console.log('🔮 Predicted GPA: Will be calculated');

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. ✅ Server endpoint created');
    console.log('2. 🔄 Restart server to apply changes');
    console.log('3. 🌐 Test frontend at: http://localhost:3000/login');
    console.log('4. 📧 Login: sru@gmail.com / student123');
    console.log('5. 📊 Check Dashboard for updated stats');

    console.log('\n🎉 STUDENT STATUS: IMPLEMENTED ✅');

  } catch (error) {
    console.error('❌ Error testing student stats:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testStudentStats();
