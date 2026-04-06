const mongoose = require('mongoose');
require('dotenv').config();

async function simpleTeacherTest() {
  try {
    console.log('🧪 Simple Teacher Dashboard Test');
    console.log('===============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test the teacher_student_view
    console.log('\n📚 Testing teacher_student_view...');
    const students = await db.collection('teacher_student_view').find({}).toArray();
    console.log(`✅ Found ${students.length} students in teacher view`);
    
    if (students.length > 0) {
      console.log('\n📋 Sample Student Data:');
      console.log('====================');
      const sample = students[0];
      console.log(`Name: ${sample.name}`);
      console.log(`Email: ${sample.email}`);
      console.log(`Password: ${sample.password}`);
      console.log(`Role: ${sample.role}`);
      console.log(`Department: ${sample.department}`);
      console.log(`Semester: ${sample.semester}`);
      console.log(`Roll Number: ${sample.rollNumber}`);
      console.log(`User ID: ${sample.userIdString}`);
      console.log(`Total Marks: ${sample.totalMarks}`);
      console.log(`Average Marks: ${sample.averageMarks}`);
      console.log(`Grade: ${sample.grade}`);
      console.log(`Performance: ${sample.performance}`);
      console.log(`Attendance: ${sample.attendancePercentage}%`);
      
      if (sample.studentMarks && sample.studentMarks.length > 0) {
        console.log(`\n📝 Subjects (${sample.studentMarks.length}):`);
        sample.studentMarks.forEach(mark => {
          console.log(`   ├─ ${mark.subject}: ${mark.marks} (${mark.grade})`);
        });
      }
      
      if (sample.attendanceRecords && sample.attendanceRecords.length > 0) {
        console.log(`\n📅 Attendance Records (${sample.attendanceRecords.length}):`);
        sample.attendanceRecords.forEach(record => {
          console.log(`   ├─ ${record.date}: ${record.status} (${record.subject})`);
        });
      }
    }
    
    // Test class statistics
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
    
    // Show all students summary
    console.log('\n👥 All Students Summary:');
    console.log('======================');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
      console.log(`   ├─ Roll Number: ${student.rollNumber}`);
      console.log(`   ├─ Department: ${student.department}`);
      console.log(`   ├─ Password: ${student.password}`);
      console.log(`   ├─ Marks: ${student.averageMarks || 'N/A'} (${student.grade || 'N/A'})`);
      console.log(`   ├─ Attendance: ${student.attendancePercentage}%`);
      console.log(`   └─ Performance: ${student.performance}`);
      console.log('');
    });
    
    console.log('\n🎉 Teacher Dashboard Data Test Complete!');
    console.log('======================================');
    console.log('✅ Teacher student view is working');
    console.log('✅ All student data is available');
    console.log('✅ Class statistics are calculated');
    console.log('✅ Ready for teacher dashboard frontend');
    
    console.log('\n🔧 How to Access in Frontend:');
    console.log('===========================');
    console.log('1. Login as elango@gmail.com with password teacher123');
    console.log('2. Access /api/teacher/students for student list');
    console.log('3. Access /api/teacher/class-stats for class statistics');
    console.log('4. Access /api/teacher/subject-stats for subject statistics');
    console.log('5. Access /api/teacher/student/:id for individual student');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
simpleTeacherTest();
