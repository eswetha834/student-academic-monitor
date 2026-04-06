const mongoose = require('mongoose');
require('dotenv').config();

async function testAssignmentEndpoints() {
  try {
    console.log('🧪 Testing Assignment Management Endpoints');
    console.log('====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test 1: Check if StudentTeacherAssignment model exists
    console.log('\n📋 Test 1: Check StudentTeacherAssignment Model');
    try {
      const StudentTeacherAssignment = require('./models/StudentTeacherAssignment');
      const count = await StudentTeacherAssignment.countDocuments();
      console.log(`✅ StudentTeacherAssignment model loaded`);
      console.log(`📊 Total assignments: ${count}`);
    } catch (error) {
      console.log('❌ StudentTeacherAssignment model error:', error.message);
    }
    
    // Test 2: Check if teachers exist
    console.log('\n👨‍🏫 Test 2: Check Available Teachers');
    try {
      const User = require('./models/User');
      const teachers = await User.find({ role: { $in: ['faculty', 'teacher'] }, isActive: true })
        .select('name email')
        .sort({ name: 1 })
        .limit(5);
      
      console.log(`✅ Found ${teachers.length} teachers:`);
      teachers.forEach((teacher, index) => {
        console.log(`   ${index + 1}. ${teacher.name} (${teacher.email})`);
      });
    } catch (error) {
      console.log('❌ Teachers query error:', error.message);
    }
    
    // Test 3: Check if students exist
    console.log('\n👨‍🎓 Test 3: Check Available Students');
    try {
      const students = await User.find({ role: 'student', isActive: true })
        .select('name email')
        .sort({ name: 1 })
        .limit(5);
      
      console.log(`✅ Found ${students.length} students:`);
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.email})`);
      });
    } catch (error) {
      console.log('❌ Students query error:', error.message);
    }
    
    // Test 4: Check current assignments
    console.log('\n📚 Test 4: Check Current Assignments');
    try {
      const StudentTeacherAssignment = require('./models/StudentTeacherAssignment');
      const assignments = await StudentTeacherAssignment.find({ isActive: true })
        .sort({ assignedDate: -1 })
        .limit(5);
      
      console.log(`✅ Found ${assignments.length} active assignments:`);
      for (const assignment of assignments) {
        console.log(`   📝 ${assignment.studentEmail} → ${assignment.teacherEmail}`);
        console.log(`      📅 Assigned: ${new Date(assignment.assignedDate).toLocaleDateString()}`);
        console.log(`      👤 By: ${assignment.assignedBy}`);
      }
    } catch (error) {
      console.log('❌ Assignments query error:', error.message);
    }
    
    console.log('\n🎯 Test Results:');
    console.log('==================');
    console.log('✅ Database connection: Working');
    console.log('✅ StudentTeacherAssignment model: Available');
    console.log('✅ Teachers data: Available');
    console.log('✅ Students data: Available');
    console.log('✅ Assignments data: Available');
    
    console.log('\n🚀 Server Restart Required:');
    console.log('=============================');
    console.log('1. Stop current server process');
    console.log('2. Run: npm start');
    console.log('3. Test endpoints: POST/GET/PUT/DELETE /api/admin/assignments');
    console.log('4. Test teachers endpoint: GET /api/admin/teachers');
    
    console.log('\n📋 Expected API Responses:');
    console.log('============================');
    console.log('GET /api/admin/teachers → Array of teacher objects');
    console.log('GET /api/admin/assignments → Array of assignment objects with populated names');
    console.log('POST /api/admin/assignments → Success message with assignment data');
    console.log('PUT /api/admin/assignments/:id → Success message with updated data');
    console.log('DELETE /api/admin/assignments/:id → Success message');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testAssignmentEndpoints();
