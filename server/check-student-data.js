const mongoose = require('mongoose');
require('dotenv').config();

async function checkStudentData() {
  try {
    console.log('🔍 Checking Student Data Structure');
    console.log('=================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check teacher_student_view data structure
    console.log('\n📚 Checking teacher_student_view...');
    const students = await db.collection('teacher_student_view').find({}).limit(2).toArray();
    
    if (students.length > 0) {
      console.log('✅ Found students in teacher_student_view');
      console.log('\n📋 Sample Student Data Structure:');
      
      students.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.name} (${student.email})`);
        console.log('   Available fields:');
        
        Object.keys(student).forEach(key => {
          if (key !== '_id') {
            const value = student[key];
            const type = typeof value;
            const displayValue = type === 'object' ? JSON.stringify(value) : value;
            console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
          }
        });
        
        // Check specific fields we need
        console.log('\n   🎯 Critical Fields Check:');
        console.log(`   ├─ CGPA: ${student.cgpa || 'MISSING'}`);
        console.log(`   ├─ GPA: ${student.gpa || 'MISSING'}`);
        console.log(`   ├─ Average Marks: ${student.averageMarks || 'MISSING'}`);
        console.log(`   ├─ Total Marks: ${student.totalMarks || 'MISSING'}`);
        console.log(`   ├─ Attendance: ${student.attendance || 'MISSING'}`);
        console.log(`   ├─ Attendance Percentage: ${student.attendancePercentage || 'MISSING'}`);
        console.log(`   ├─ Performance: ${student.performance || 'MISSING'}`);
        console.log(`   ├─ Grade: ${student.grade || 'MISSING'}`);
        console.log(`   ├─ Student Marks: ${student.studentMarks ? 'EXISTS' : 'MISSING'}`);
        console.log(`   ├─ Attendance Records: ${student.attendanceRecords ? 'EXISTS' : 'MISSING'}`);
      });
    } else {
      console.log('❌ No students found in teacher_student_view');
    }
    
    // Check raw student data
    console.log('\n🔍 Checking raw student collection...');
    const rawStudents = await db.collection('users').find({ role: 'student' }).limit(2).toArray();
    
    if (rawStudents.length > 0) {
      console.log('✅ Found students in users collection');
      console.log('\n📋 Raw Student Data Structure:');
      
      rawStudents.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.name} (${student.email})`);
        console.log('   Available fields:');
        
        Object.keys(student).forEach(key => {
          if (key !== '_id') {
            const value = student[key];
            const type = typeof value;
            const displayValue = type === 'object' ? JSON.stringify(value) : value;
            console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
          }
        });
      });
    }
    
    // Check marks collection
    console.log('\n📝 Checking marks collection...');
    const marksCount = await db.collection('marks').countDocuments();
    console.log(`✅ Found ${marksCount} marks records`);
    
    if (marksCount > 0) {
      const sampleMarks = await db.collection('marks').findOne();
      console.log('\n📋 Sample Marks Record:');
      Object.keys(sampleMarks).forEach(key => {
        if (key !== '_id') {
          const value = sampleMarks[key];
          const type = typeof value;
          const displayValue = type === 'object' ? JSON.stringify(value) : value;
          console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
        }
      });
    }
    
    // Check attendance collection
    console.log('\n📅 Checking attendance collection...');
    const attendanceCount = await db.collection('attendances').countDocuments();
    console.log(`✅ Found ${attendanceCount} attendance records`);
    
    if (attendanceCount > 0) {
      const sampleAttendance = await db.collection('attendances').findOne();
      console.log('\n📋 Sample Attendance Record:');
      Object.keys(sampleAttendance).forEach(key => {
        if (key !== '_id') {
          const value = sampleAttendance[key];
          const type = typeof value;
          const displayValue = type === 'object' ? JSON.stringify(value) : value;
          console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
        }
      });
    }
    
    console.log('\n🎯 Frontend Data Mapping Check:');
    console.log('=================================');
    console.log('Frontend expects these fields:');
    console.log('   ├─ cgpa or averageMarks');
    console.log('   ├─ attendance or attendancePercentage');
    console.log('   ├─ performance');
    console.log('   ├─ grade');
    console.log('   ├─ studentMarks array');
    console.log('   ├─ attendanceRecords array');
    
    console.log('\n🔧 Issues Found:');
    console.log('===============');
    
    // Check for missing fields
    if (students.length > 0) {
      const sampleStudent = students[0];
      const missingFields = [];
      
      if (!sampleStudent.cgpa && !sampleStudent.averageMarks) missingFields.push('CGPA/AverageMarks');
      if (!sampleStudent.attendance && !sampleStudent.attendancePercentage) missingFields.push('Attendance/AttendancePercentage');
      if (!sampleStudent.performance) missingFields.push('Performance');
      if (!sampleStudent.grade) missingFields.push('Grade');
      if (!sampleStudent.studentMarks) missingFields.push('StudentMarks');
      if (!sampleStudent.attendanceRecords) missingFields.push('AttendanceRecords');
      
      if (missingFields.length > 0) {
        console.log('❌ Missing fields in teacher_student_view:');
        missingFields.forEach(field => console.log(`   ├─ ${field}`));
      } else {
        console.log('✅ All required fields present');
      }
    }
    
    console.log('\n🚀 Solutions:');
    console.log('===========');
    console.log('1. Check if marks and attendance data exists');
    console.log('2. Verify teacher_student_view aggregation pipeline');
    console.log('3. Update frontend to use correct field names');
    console.log('4. Add sample data if collections are empty');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkStudentData();
