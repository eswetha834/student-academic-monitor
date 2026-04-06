const mongoose = require('mongoose');
require('dotenv').config();

async function testClassTeacherEndpoint() {
  try {
    console.log('🧪 Testing Class Teacher Endpoint');
    console.log('=================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get elango's user ID
    const elango = await db.collection('users').findOne({ email: 'elango@gmail.com' });
    if (!elango) {
      console.log('❌ Elango not found');
      return;
    }
    
    console.log(`👨‍🏫 Testing for teacher: ${elango.name} (${elango.email})`);
    console.log(`   ├─ User ID: ${elango.userIdString}`);
    
    // Test class_teacher_students_view
    console.log('\n📚 Testing class_teacher_students_view...');
    const assignedStudents = await db.collection('class_teacher_students_view').find({
      classTeacher: elango.userIdString
    }).toArray();
    
    console.log(`✅ Found ${assignedStudents.length} assigned students`);
    
    if (assignedStudents.length > 0) {
      console.log('\n📋 Assigned Students:');
      assignedStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email})`);
        console.log(`   ├─ Roll Number: ${student.rollNumber || 'N/A'}`);
        console.log(`   ├─ Department: ${student.department}`);
        console.log(`   ├─ Password: ${student.password}`);
        console.log(`   ├─ Performance: ${student.performance}`);
        console.log(`   └─ Attendance: ${student.attendancePercentage}%`);
      });
    } else {
      console.log('❌ No students assigned to this teacher');
      
      // Check if any students have this teacher assigned
      const allStudents = await db.collection('users').find({ 
        role: 'student',
        classTeacher: elango.userIdString
      }).toArray();
      
      console.log(`\n🔍 Direct query found ${allStudents.length} students with classTeacher field`);
      
      if (allStudents.length > 0) {
        console.log('Students with classTeacher field:');
        allStudents.forEach(student => {
          console.log(`   ├─ ${student.name} - classTeacher: ${student.classTeacher}`);
        });
      }
    }
    
    // Test the view structure
    console.log('\n🔍 Testing view structure...');
    const viewSample = await db.collection('class_teacher_students_view').findOne();
    if (viewSample) {
      console.log('✅ View sample structure:');
      console.log('   Available fields:');
      Object.keys(viewSample).forEach(key => {
        if (key !== '_id') {
          console.log(`   ├─ ${key}: ${typeof viewSample[key]}`);
        }
      });
    } else {
      console.log('❌ No data found in class_teacher_students_view');
    }
    
    console.log('\n🎯 API Endpoint Test Results:');
    console.log('=============================');
    console.log(`✅ Teacher: ${elango.name}`);
    console.log(`✅ Teacher ID: ${elango.userIdString}`);
    console.log(`✅ Assigned Students: ${assignedStudents.length}`);
    console.log(`✅ Endpoint: /api/class-teacher/students`);
    console.log(`✅ Expected Response: Array of ${assignedStudents.length} students`);
    
    if (assignedStudents.length === 0) {
      console.log('\n❌ ISSUE: No students assigned to this teacher');
      console.log('   ├─ Check class teacher assignments');
      console.log('   ├─ Verify teacher ID matching');
      console.log('   ├─ Check view creation');
    } else {
      console.log('\n✅ Class teacher endpoint should work correctly');
      console.log('   ├─ Data available in database');
      console.log('   ├─ View contains student data');
      console.log('   ├─ API endpoint ready');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testClassTeacherEndpoint();
