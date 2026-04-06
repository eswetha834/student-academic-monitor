const mongoose = require('mongoose');
require('dotenv').config();

async function checkMarksStructure() {
  try {
    console.log('🔍 Checking Marks Collection Structure');
    console.log('=====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check marks collection
    console.log('\n📝 Checking marks collection...');
    const marksCount = await db.collection('marks').countDocuments();
    console.log(`Found ${marksCount} marks records`);
    
    if (marksCount > 0) {
      const sampleMarks = await db.collection('marks').find({}).limit(5).toArray();
      console.log('\n📋 Sample Marks Records:');
      
      sampleMarks.forEach((mark, index) => {
        console.log(`\n${index + 1}. Marks Record:`);
        Object.keys(mark).forEach(key => {
          if (key !== '_id') {
            const value = mark[key];
            const type = typeof value;
            const displayValue = type === 'object' ? JSON.stringify(value) : value;
            console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
          }
        });
      });
      
      // Check studentId field types
      console.log('\n🎯 Student ID Analysis:');
      const studentIds = await db.collection('marks').distinct('studentId');
      console.log(`Found ${studentIds.length} unique student IDs:`);
      studentIds.slice(0, 5).forEach(id => {
        console.log(`   ├─ ${id} (type: ${typeof id})`);
      });
      
      // Check if studentId matches userIdString format
      console.log('\n🔍 Checking ID format matching...');
      const students = await db.collection('users').find({ role: 'student' }).limit(3).toArray();
      
      for (const student of students) {
        const studentId = student.userIdString;
        const matchingMarks = await db.collection('marks').find({ studentId }).toArray();
        console.log(`\n${student.name} (${student.email}):`);
        console.log(`   ├─ userIdString: ${studentId}`);
        console.log(`   ├─ Matching marks: ${matchingMarks.length} records`);
        
        if (matchingMarks.length > 0) {
          matchingMarks.forEach(mark => {
            console.log(`   │  ├─ ${mark.subject}: ${mark.marks}`);
          });
        }
      }
    }
    
    // Check attendance collection
    console.log('\n📅 Checking attendance collection...');
    const attendanceCount = await db.collection('attendancerecords').countDocuments();
    console.log(`Found ${attendanceCount} attendance records`);
    
    if (attendanceCount > 0) {
      const sampleAttendance = await db.collection('attendancerecords').find({}).limit(3).toArray();
      console.log('\n📋 Sample Attendance Records:');
      
      sampleAttendance.forEach((att, index) => {
        console.log(`\n${index + 1}. Attendance Record:`);
        Object.keys(att).forEach(key => {
          if (key !== '_id') {
            const value = att[key];
            const type = typeof value;
            const displayValue = type === 'object' ? JSON.stringify(value) : value;
            console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
          }
        });
      });
    }
    
    console.log('\n🔧 Issues Found:');
    console.log('===============');
    
    // Check for ID matching issues
    if (marksCount > 0) {
      const students = await db.collection('users').find({ role: 'student' }).toArray();
      let matchedStudents = 0;
      
      for (const student of students) {
        const studentId = student.userIdString;
        const matchingMarks = await db.collection('marks').find({ studentId }).toArray();
        if (matchingMarks.length > 0) {
          matchedStudents++;
        }
      }
      
      console.log(`📊 Students with marks: ${matchedStudents}/${students.length}`);
      
      if (matchedStudents < students.length) {
        console.log('❌ Some students have no marks records');
        console.log('   ├─ Check studentId format in marks collection');
        console.log('   ├─ Verify userIdString matches marks.studentId');
      }
    }
    
    if (attendanceCount === 0) {
      console.log('❌ No attendance records found');
      console.log('   ├─ Need to add sample attendance data');
    }
    
    console.log('\n🚀 Solutions:');
    console.log('===========');
    console.log('1. Fix marks.studentId to match users.userIdString');
    console.log('2. Update teacher_student_view lookup');
    console.log('3. Add sample attendance data');
    console.log('4. Test view after fixes');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkMarksStructure();
