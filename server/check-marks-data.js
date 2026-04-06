const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const AttendanceRecord = require('./models/AttendanceRecord');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  try {
    const students = await User.find({email: {$in: ['sru@gmail.com', 'charu@gmail.com']}});
    console.log('Students found:', students.map(s => ({name: s.name, email: s.email, id: s._id.toString()})));
    
    const marks = await Marks.find({studentId: {$in: students.map(s => s._id)}});
    console.log('Marks records for assigned students:', marks.length);
    marks.forEach(m => console.log(`  - ${m.studentId}: ${m.marks} (${m.percentage}%)`));
    
    const attendance = await AttendanceRecord.find({studentId: {$in: students.map(s => s._id)}});
    console.log('Attendance records for assigned students:', attendance.length);
    
    if (marks.length === 0) {
      console.log('\nNo marks found. Creating sample data...');
      for (const student of students) {
        await Marks.create({
          studentId: student._id,
          subjectCode: 'CS101',
          marks: Math.floor(Math.random() * 40 + 60),
          percentage: Math.floor(Math.random() * 40 + 60),
          gpa: (Math.random() * 2 + 6).toFixed(2)
        });
        console.log(`Created marks for ${student.name}`);
      }
    }
    
    if (attendance.length === 0) {
      console.log('\nNo attendance found. Creating sample data...');
      for (const student of students) {
        for (let i = 0; i < 20; i++) {
          await AttendanceRecord.create({
            studentId: student._id,
            date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            status: Math.random() > 0.1 ? 'Present' : 'Absent'
          });
        }
        console.log(`Created 20 attendance records for ${student.name}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  mongoose.disconnect();
}).catch(console.error);
