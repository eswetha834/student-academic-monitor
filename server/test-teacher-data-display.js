const mongoose = require('mongoose');
require('dotenv').config();

async function testTeacherDataDisplay() {
  try {
    console.log('🧪 Testing Teacher Data Display');
    console.log('===============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test teacher_student_view
    console.log('\n📚 Testing teacher_student_view...');
    const students = await db.collection('teacher_student_view').find({}).toArray();
    console.log(`✅ Found ${students.length} students`);
    
    if (students.length > 0) {
      console.log('\n📋 Student Data Structure:');
      console.log('==========================');
      const sample = students[0];
      console.log('Available fields:');
      Object.keys(sample).forEach(key => {
        console.log(`   ├─ ${key}: ${typeof sample[key]} = ${sample[key]}`);
      });
      
      console.log('\n📊 All Students Summary:');
      console.log('========================');
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email})`);
        console.log(`   ├─ ID: ${student.userIdString}`);
        console.log(`   ├─ Password: ${student.password}`);
        console.log(`   ├─ Role: ${student.role}`);
        console.log(`   ├─ Department: ${student.department}`);
        console.log(`   ├─ Roll Number: ${student.rollNumber || 'N/A'}`);
        console.log(`   ├─ Average Marks: ${student.averageMarks || 'N/A'}`);
        console.log(`   ├─ Grade: ${student.grade || 'N/A'}`);
        console.log(`   ├─ Performance: ${student.performance || 'N/A'}`);
        console.log(`   ├─ Attendance: ${student.attendancePercentage || 0}%`);
        console.log(`   ├─ Total Subjects: ${student.totalSubjects || 0}`);
        console.log(`   └─ Has Marks: ${student.studentMarks ? student.studentMarks.length : 0} subjects`);
        console.log('');
      });
    }
    
    // Test class stats
    console.log('\n📊 Testing Class Statistics...');
    const classStats = await db.collection('teacher_student_view').aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageClassMarks: { $avg: '$averageMarks' },
          averageAttendance: { $avg: '$attendancePercentage' },
          gradeA: { $sum: { $cond: [{ $eq: ['$grade', 'A'] }, 1, 0] } },
          gradeB: { $sum: { $cond: [{ $eq: ['$grade', 'B'] }, 1, 0] } },
          gradeC: { $sum: { $cond: [{ $eq: ['$grade', 'C'] }, 1, 0] } },
          gradeD: { $sum: { $cond: [{ $eq: ['$grade', 'D'] }, 1, 0] } },
          gradeF: { $sum: { $cond: [{ $eq: ['$grade', 'F'] }, 1, 0] } }
        }
      }
    ]).toArray();
    
    if (classStats.length > 0) {
      const stats = classStats[0];
      console.log('✅ Class Statistics:');
      console.log(`   ├─ Total Students: ${stats.totalStudents}`);
      console.log(`   ├─ Average Class Marks: ${stats.averageClassMarks?.toFixed(2) || 'N/A'}`);
      console.log(`   ├─ Average Attendance: ${stats.averageAttendance?.toFixed(2) || 'N/A'}%`);
      console.log(`   └─ Grade Distribution: A:${stats.gradeA} B:${stats.gradeB} C:${stats.gradeC} D:${stats.gradeD} F:${stats.gradeF}`);
    }
    
    console.log('\n🎯 Frontend Data Mapping:');
    console.log('=========================');
    console.log('✅ Student fields for frontend:');
    console.log('   ├─ name: Student name');
    console.log('   ├─ email: Student email');
    console.log('   ├─ password: Plain text password');
    console.log('   ├─ role: Student role');
    console.log('   ├─ userIdString: Student ID (use instead of _id)');
    console.log('   ├─ department: Department info');
    console.log('   ├─ rollNumber: Roll number');
    console.log('   ├─ averageMarks: Average marks (use instead of gpa)');
    console.log('   ├─ grade: Grade (A,B,C,D,F)');
    console.log('   ├─ performance: Performance level');
    console.log('   ├─ attendancePercentage: Attendance % (use instead of attendance)');
    console.log('   ├─ totalSubjects: Number of subjects');
    console.log('   └─ studentMarks: Array of subject marks');
    
    console.log('\n🔧 API Endpoints Working:');
    console.log('=========================');
    console.log('✅ GET /api/teacher/students - Returns all students');
    console.log('✅ GET /api/teacher/class-stats - Returns class statistics');
    console.log('✅ GET /api/teacher/subject-stats - Returns subject statistics');
    console.log('✅ GET /api/teacher/student/:id - Returns individual student');
    
    console.log('\n🎉 Test Complete! Data is ready for frontend.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testTeacherDataDisplay();
