const mongoose = require('mongoose');
const User = require('./models/User');
const AttendanceRecord = require('./models/AttendanceRecord');
const Role = require('./models/Role');
require('dotenv').config();

async function addSampleAttendance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find the student user
    const studentRole = await Role.findOne({ name: 'student' });
    const student = await User.findOne({ email: 'student@gmail.com', role: studentRole._id });
    
    if (!student) {
      console.log('Student user not found');
      process.exit(0);
    }

    console.log('Found student:', student.name);

    // Check if attendance records already exist
    const existingAttendance = await AttendanceRecord.find({ studentId: student._id });
    console.log('Existing attendance records count:', existingAttendance.length);

    // Add sample attendance if none exist
    if (existingAttendance.length === 0) {
      const sampleAttendance = [];
      const today = new Date();
      
      // Add attendance for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // 90% present rate (occasionally absent)
        const status = Math.random() > 0.1 ? 'Present' : 'Absent';
        
        sampleAttendance.push({
          studentId: student._id,
          date: date,
          status: status,
          subject: 'General' // You can make this more specific
        });
      }

      await AttendanceRecord.insertMany(sampleAttendance);
      console.log(`✅ Added ${sampleAttendance.length} sample attendance records`);
    } else {
      console.log('Attendance records already exist');
    }

    // Calculate and display attendance percentage
    const allAttendance = await AttendanceRecord.find({ studentId: student._id });
    const presentCount = allAttendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = Math.round((presentCount / allAttendance.length) * 100);
    
    console.log('\n📊 Attendance Summary:');
    console.log(`Total Days: ${allAttendance.length}`);
    console.log(`Present: ${presentCount}`);
    console.log(`Attendance Rate: ${attendancePercentage}%`);

  } catch (error) {
    console.error('Error adding sample attendance:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addSampleAttendance();
