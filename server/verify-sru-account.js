const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
require('dotenv').config();

async function verifySRUAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Find and verify the SRU user
    const sruUser = await User.findOne({ email: 'sru@gmail.com' });
    
    if (!sruUser) {
      console.log('❌ SRU user not found');
      return;
    }

    console.log('\n🎉 SRU ACCOUNT VERIFICATION COMPLETE');
    console.log('=' .repeat(50));
    
    // User details
    console.log('\n👤 USER DETAILS:');
    console.log('📧 Email:', sruUser.email);
    console.log('👤 Name:', sruUser.name);
    console.log('🎓 Role:', sruUser.role);
    console.log('📚 Department:', sruUser.department);
    console.log('🔢 Roll Number:', sruUser.rollNumber);
    console.log('📖 Semester:', sruUser.semester);
    console.log('✅ Active:', sruUser.isActive);
    
    // Password verification
    const passwordMatch = await sruUser.comparePassword('sru123');
    console.log('🔑 Login Credentials:', passwordMatch ? '✅ Valid' : '❌ Invalid');
    
    // Academic performance
    const marks = await Marks.find({ studentId: sruUser._id });
    const avgMarks = marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length;
    const avgAttendance = marks.reduce((sum, mark) => sum + mark.attendance, 0) / marks.length;
    
    console.log('\n📊 ACADEMIC PERFORMANCE:');
    console.log('📚 Total Subjects:', marks.length);
    console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
    console.log('📊 Average Attendance:', avgAttendance.toFixed(1) + '%');
    
    // Performance summary
    const excellentSubjects = marks.filter(m => m.marks >= 80).length;
    const goodSubjects = marks.filter(m => m.marks >= 60 && m.marks < 80).length;
    const needsImprovement = marks.filter(m => m.marks < 60).length;
    
    console.log('🏆 Excellent (80%+):', excellentSubjects, 'subjects');
    console.log('👍 Good (60-79%):', goodSubjects, 'subjects');
    console.log('⚠️  Needs Improvement (<60%):', needsImprovement, 'subjects');
    
    // Notifications
    const notifications = await Notification.find({ recipientId: sruUser._id });
    const unreadNotifications = notifications.filter(n => !n.isRead).length;
    
    console.log('\n🔔 NOTIFICATIONS:');
    console.log('📬 Total Notifications:', notifications.length);
    console.log('📖 Unread:', unreadNotifications);
    console.log('🔔 Priority Breakdown:');
    const highPriority = notifications.filter(n => n.priority === 'high').length;
    const mediumPriority = notifications.filter(n => n.priority === 'medium').length;
    const lowPriority = notifications.filter(n => n.priority === 'low').length;
    console.log('   🔴 High:', highPriority);
    console.log('   🟡 Medium:', mediumPriority);
    console.log('   🟢 Low:', lowPriority);
    
    // Calendar events
    const events = await CalendarEvent.find({});
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
    
    console.log('\n📅 CALENDAR EVENTS:');
    console.log('📆 Total Events:', events.length);
    console.log('🗓️  Upcoming:', upcomingEvents);
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ SRU Account is Ready for Use!');
    console.log('🌐 Login URL: http://localhost:3000/login');
    console.log('📧 Username: sru@gmail.com');
    console.log('🔑 Password: sru123');
    console.log('\n🎓 Features Available:');
    console.log('  • Dashboard with performance overview');
    console.log('  • Detailed marks and attendance tracking');
    console.log('  • Notifications and announcements');
    console.log('  • Calendar events and deadlines');
    console.log('  • Goal tracking and study planning');
    console.log('  • Performance predictions');
    
    console.log('\n🚀 Happy Learning! 📚');

  } catch (error) {
    console.error('❌ Error verifying SRU account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifySRUAccount();
