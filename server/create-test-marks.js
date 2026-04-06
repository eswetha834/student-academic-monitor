// Create test marks data for predictions
const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');

async function createTestMarks() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`📚 Found ${students.length} students`);

    // Create test marks for each student
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
    
    for (const student of students) {
      // Check if marks already exist
      const existingMarks = await Marks.find({ studentId: student._id });
      if (existingMarks.length > 0) {
        console.log(`⏭️  Marks already exist for ${student.name}`);
        continue;
      }

      // Create marks for different semesters
      for (let semester = 1; semester <= 3; semester++) {
        for (const subject of subjects) {
          // Generate random marks with some variation based on student
          const baseMark = student.name === 'Alice Johnson' ? 85 : 
                          student.name === 'Bob Smith' ? 72 :
                          student.name === 'Carol Williams' ? 78 : 65;
          
          const variation = Math.floor(Math.random() * 20) - 10;
          const marks = Math.max(40, Math.min(95, baseMark + variation));

          const mark = new Marks({
            studentId: student._id,
            subject,
            marks,
            semester: semester.toString(),
            date: new Date(Date.now() - (3 - semester) * 90 * 24 * 60 * 60 * 1000), // Different dates for each semester
            totalMarks: 100,
            grade: marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B' : marks >= 60 ? 'C' : 'D'
          });
          
          await mark.save();
        }
      }
      
      console.log(`✅ Created marks for ${student.name}`);
    }

    // Create attendance records
    const db = mongoose.connection.db;
    const attendanceCollection = db.collection('attendancerecords');
    
    for (const student of students) {
      // Check if attendance already exists
      const existingAttendance = await attendanceCollection.find({ studentId: student._id }).toArray();
      if (existingAttendance.length > 0) {
        console.log(`⏭️  Attendance already exists for ${student.name}`);
        continue;
      }

      // Create attendance records for the past 30 days
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        // Generate attendance with some variation
        const attendanceRate = student.name === 'Alice Johnson' ? 0.95 : 
                              student.name === 'Bob Smith' ? 0.75 :
                              student.name === 'Carol Williams' ? 0.85 : 0.60;
        
        const status = Math.random() < attendanceRate ? 'Present' : 'Absent';
        
        await attendanceCollection.insertOne({
          studentId: student._id,
          date,
          status,
          semester: '6th'
        });
      }
      
      console.log(`✅ Created attendance for ${student.name}`);
    }

    console.log('\n🎯 Test marks and attendance data created successfully!');
    console.log('🔮 Now you can test the prediction generation!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestMarks();
