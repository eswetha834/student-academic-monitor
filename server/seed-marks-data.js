const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  try {
    const students = await User.find({email: {$in: ['sru@gmail.com', 'charu@gmail.com']}});
    console.log('Adding comprehensive marks data...\n');
    
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
    const examTypes = ['Internal', 'Midterm', 'Final'];
    
    for (const student of students) {
      // Clear old marks
      await Marks.deleteMany({studentId: student._id});
      
      // Add new marks for each subject
      for (const subject of subjects) {
        for (const examType of examTypes) {
          const marks = Math.floor(Math.random() * 30 + 50); // 50-80
          const attendance = Math.floor(Math.random() * 15 + 75); // 75-90
          
          await Marks.create({
            studentId: student._id,
            subject,
            examType,
            marks,
            attendance,
            suggestion: marks < 60 ? 'Needs improvement' : 'Good performance',
            date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          });
        }
      }
      console.log(`✓ Added marks for ${student.name} (${student.email})`);
    }
    
    console.log('\nVerifying data:');
    for (const student of students) {
      const marksCount = await Marks.countDocuments({studentId: student._id});
      const avgMarks = await Marks.aggregate([
        {$match: {studentId: student._id}},
        {$group: {_id: null, avg: {$avg: '$marks'}}}
      ]);
      const avgAttendance = await Marks.aggregate([
        {$match: {studentId: student._id}},
        {$group: {_id: null, avg: {$avg: '$attendance'}}}
      ]);
      
      console.log(`\n${student.name}:`);
      console.log(`  Records: ${marksCount}`);
      console.log(`  Avg Marks: ${avgMarks[0]?.avg.toFixed(2) || 0}`);
      console.log(`  Avg Attendance: ${avgAttendance[0]?.avg.toFixed(2) || 0}%`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  mongoose.disconnect();
}).catch(console.error);
