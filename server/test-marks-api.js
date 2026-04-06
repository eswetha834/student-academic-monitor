const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testMarksAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Find SRU student
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    console.log('👤 Testing API for:', sruStudent.email);
    console.log('🆔 Student ID:', sruStudent._id);

    // Test the marks query (same as API would use)
    const marks = await Marks.find({ studentId: sruStudent._id });
    console.log('\n📊 API QUERY RESULTS:');
    console.log('📋 Total records found:', marks.length);

    if (marks.length > 0) {
      console.log('\n📈 MARKS DATA (as API would return):');
      marks.forEach((mark, index) => {
        console.log(`${index + 1}. Subject: ${mark.subject}`);
        console.log(`   Exam: ${mark.examType}`);
        console.log(`   Marks: ${mark.marks}%`);
        console.log(`   Attendance: ${mark.attendance}%`);
        console.log(`   Grade: ${getGrade(mark.marks)}`);
        console.log(`   Student ID: ${mark.studentId}`);
        console.log('');
      });

      // Test different query formats
      console.log('🔍 TESTING DIFFERENT QUERIES:');
      
      // Query by userIdString (if frontend uses this)
      const marksByString = await Marks.find({ studentId: sruStudent.userIdString });
      console.log('📋 By userIdString:', marksByString.length, 'records');

      // Query by email (if frontend uses this)
      const marksByEmail = await Marks.find({ email: sruStudent.email });
      console.log('📋 By email:', marksByEmail.length, 'records');

      // Check if studentId field exists in marks
      console.log('\n🔍 MARKS COLLECTION ANALYSIS:');
      const sampleMark = marks[0];
      console.log('📋 Sample mark fields:', Object.keys(sampleMark.toObject()));
      console.log('📋 Student ID type:', typeof sampleMark.studentId);
      console.log('📋 Student ID value:', sampleMark.studentId);
      console.log('📋 Matches SRU ID:', sampleMark.studentId.toString() === sruStudent._id.toString());

      // Check if there are any marks without proper studentId
      const orphanedMarks = await Marks.find({ studentId: { $exists: false } });
      console.log('📋 Orphaned marks (no studentId):', orphanedMarks.length);

      const nullMarks = await Marks.find({ studentId: null });
      console.log('📋 Null studentId marks:', nullMarks.length);

    } else {
      console.log('❌ No marks found for SRU student');
      
      // Check if there are any marks at all
      const allMarks = await Marks.find({});
      console.log('📊 Total marks in database:', allMarks.length);
      
      if (allMarks.length > 0) {
        console.log('📋 Sample mark studentId:', allMarks[0].studentId);
        console.log('📋 SRU studentId:', sruStudent._id);
        console.log('📋 Types match?', typeof allMarks[0].studentId, typeof sruStudent._id);
      }
    }

    console.log('\n🎯 API DIAGNOSIS COMPLETE');
    console.log('📊 Data exists in database');
    console.log('🔍 Check frontend API call logic');
    console.log('🌐 Verify API endpoint: /api/marks');

  } catch (error) {
    console.error('❌ Error testing marks API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'B+';
  if (marks >= 75) return 'B';
  if (marks >= 70) return 'C+';
  if (marks >= 60) return 'C';
  if (marks >= 55) return 'D+';
  if (marks >= 50) return 'D';
  return 'F';
}

testMarksAPI();
