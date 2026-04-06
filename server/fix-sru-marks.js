const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function fixSRUMarks() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Find SRU student
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    console.log('👤 Found SRU Student:', sruStudent.name);
    console.log('🆔 Student ID:', sruStudent._id);

    // Check existing marks
    const existingMarks = await Marks.find({ studentId: sruStudent._id });
    console.log('📊 Existing marks count:', existingMarks.length);

    if (existingMarks.length === 0) {
      console.log('❌ No marks found for SRU student. Adding marks...');
      
      // Add comprehensive marks for SRU student
      const sruMarks = [
        {
          studentId: sruStudent._id,
          subject: 'Mathematics',
          examType: 'Internal Assessment 1',
          marks: 88,
          attendance: 94,
          suggestion: 'Excellent performance, maintain consistency'
        },
        {
          studentId: sruStudent._id,
          subject: 'Mathematics',
          examType: 'Internal Assessment 2',
          marks: 85,
          attendance: 94,
          suggestion: 'Good performance, keep practicing'
        },
        {
          studentId: sruStudent._id,
          subject: 'Mathematics',
          examType: 'Mid-term',
          marks: 82,
          attendance: 94,
          suggestion: 'Focus on calculus topics'
        },
        {
          studentId: sruStudent._id,
          subject: 'Physics',
          examType: 'Internal Assessment 1',
          marks: 78,
          attendance: 91,
          suggestion: 'Good understanding, practice more numerical problems'
        },
        {
          studentId: sruStudent._id,
          subject: 'Physics',
          examType: 'Mid-term',
          marks: 82,
          attendance: 91,
          suggestion: 'Improvement seen, maintain momentum'
        },
        {
          studentId: sruStudent._id,
          subject: 'Chemistry',
          examType: 'Internal Assessment',
          marks: 85,
          attendance: 89,
          suggestion: 'Strong concepts, focus on organic chemistry'
        },
        {
          studentId: sruStudent._id,
          subject: 'Data Structures',
          examType: 'Internal Assessment',
          marks: 92,
          attendance: 96,
          suggestion: 'Outstanding performance, explore advanced topics'
        },
        {
          studentId: sruStudent._id,
          subject: 'Database Management',
          examType: 'Internal Assessment',
          marks: 87,
          attendance: 93,
          suggestion: 'Good SQL skills, work on optimization techniques'
        },
        {
          studentId: sruStudent._id,
          subject: 'Computer Networks',
          examType: 'Quiz',
          marks: 79,
          attendance: 88,
          suggestion: 'Review networking protocols thoroughly'
        },
        {
          studentId: sruStudent._id,
          subject: 'Operating Systems',
          examType: 'Mid-term',
          marks: 84,
          attendance: 90,
          suggestion: 'Good understanding of concepts, practice more'
        }
      ];

      await Marks.insertMany(sruMarks);
      console.log('✅ Added 10 marks records for SRU student');
    } else {
      console.log('📊 Existing marks found:');
      existingMarks.forEach((mark, index) => {
        console.log(`${index + 1}. ${mark.subject}: ${mark.marks}% (${mark.examType})`);
      });
    }

    // Verify the marks were added
    const finalMarks = await Marks.find({ studentId: sruStudent._id });
    console.log('\n🎯 FINAL VERIFICATION:');
    console.log('📊 Total marks records:', finalMarks.length);
    
    if (finalMarks.length > 0) {
      const avgMarks = finalMarks.reduce((sum, mark) => sum + mark.marks, 0) / finalMarks.length;
      const avgAttendance = finalMarks.reduce((sum, mark) => sum + mark.attendance, 0) / finalMarks.length;
      console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
      console.log('📊 Average Attendance:', avgAttendance.toFixed(1) + '%');
      
      console.log('\n📚 Subject Performance:');
      finalMarks.forEach((mark, index) => {
        const emoji = mark.marks >= 75 ? '🟢' : mark.marks >= 60 ? '🟡' : '🔴';
        console.log(`${index + 1}. ${emoji} ${mark.subject}: ${mark.marks}% (Grade: ${getGrade(mark.marks)})`);
      });
    }

    console.log('\n🎉 SRU Student marks section is now ready!');
    console.log('🌐 Login: http://localhost:3000/login');
    console.log('📧 Email: sru@gmail.com');
    console.log('🔑 Password: student123');

  } catch (error) {
    console.error('❌ Error fixing SRU marks:', error);
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

fixSRUMarks();
