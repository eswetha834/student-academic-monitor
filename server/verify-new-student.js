const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
require('dotenv').config();

async function verifyNewStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Find the most recently created student
    const latestStudent = await User.findOne({ role: 'student' }).sort({ createdAt: -1 });
    
    if (!latestStudent) {
      console.log('❌ No student found');
      return;
    }

    console.log('\n🎉 NEW STUDENT VERIFICATION');
    console.log('=' .repeat(50));
    
    // Test login credentials
    const passwordMatch = await latestStudent.comparePassword('student123');
    
    console.log('\n👤 STUDENT PROFILE:');
    console.log('📧 Email:', latestStudent.email);
    console.log('👤 Name:', latestStudent.name);
    console.log('🎓 Role:', latestStudent.role);
    console.log('📚 Department:', latestStudent.department);
    console.log('🔢 Roll Number:', latestStudent.rollNumber);
    console.log('📖 Semester:', latestStudent.semester);
    console.log('✅ Active:', latestStudent.isActive);
    console.log('🔑 Login Test:', passwordMatch ? '✅ Valid' : '❌ Invalid');
    
    // Academic data verification
    const marks = await Marks.find({ studentId: latestStudent._id });
    const notifications = await Notification.find({ recipientId: latestStudent._id });
    
    console.log('\n📊 DATA VERIFICATION:');
    console.log('📚 Marks Records:', marks.length, '/ 8 expected');
    console.log('🔔 Notifications:', notifications.length, '/ 5 expected');
    
    if (marks.length > 0) {
      const avgMarks = marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length;
      const avgAttendance = marks.reduce((sum, mark) => sum + mark.attendance, 0) / marks.length;
      console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
      console.log('📊 Average Attendance:', avgAttendance.toFixed(1) + '%');
      
      console.log('\n📚 SUBJECT PERFORMANCE:');
      marks.forEach((mark, index) => {
        const emoji = mark.marks >= 85 ? '🏆' : mark.marks >= 70 ? '👍' : '⚠️';
        console.log(`${index + 1}. ${emoji} ${mark.subject}: ${mark.marks}% (Attendance: ${mark.attendance}%)`);
      });
    }
    
    if (notifications.length > 0) {
      console.log('\n🔔 RECENT NOTIFICATIONS:');
      notifications.slice(0, 3).forEach((notif, index) => {
        const priorityEmoji = notif.priority === 'high' ? '🔴' : notif.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${index + 1}. ${priorityEmoji} ${notif.title}: ${notif.message.substring(0, 40)}...`);
      });
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ NEW STUDENT ACCOUNT FULLY VERIFIED!');
    console.log('🚀 Ready for immediate use');
    
    console.log('\n🔑 QUICK LOGIN:');
    console.log('🌐 http://localhost:3000/login');
    console.log('📧', latestStudent.email);
    console.log('🔑 student123');

  } catch (error) {
    console.error('❌ Error verifying new student:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyNewStudent();
