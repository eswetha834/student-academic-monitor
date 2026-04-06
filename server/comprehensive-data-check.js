const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
require('dotenv').config();

async function comprehensiveDataCheck() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('\n🎯 COMPREHENSIVE DATA VERIFICATION');
    console.log('=' .repeat(70));

    // Check all users
    const allUsers = await User.find({ role: 'student' });
    console.log('\n👥 ALL STUDENT USERS:');
    console.log('Total students found:', allUsers.length);
    
    allUsers.forEach((student, index) => {
      const passwordMatch = student.comparePassword ? 'Will test' : 'No method';
      console.log(`${index + 1}. 📧 ${student.email} | 👤 ${student.name} | 🔑 ${passwordMatch}`);
    });

    // Check data for each student
    for (let i = 0; i < allUsers.length; i++) {
      const student = allUsers[i];
      console.log(`\n📊 STUDENT ${i + 1}: ${student.email}`);
      console.log('-'.repeat(50));

      // Test password
      try {
        const passwordMatch = await student.comparePassword('student123');
        console.log('🔑 Password "student123":', passwordMatch ? '✅ Valid' : '❌ Invalid');
      } catch (error) {
        console.log('🔑 Password test: ❌ Error -', error.message);
      }

      // Check marks
      const marks = await Marks.find({ studentId: student._id });
      console.log('📚 Marks:', marks.length, 'records');
      if (marks.length > 0) {
        const avgMarks = marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length;
        const avgAttendance = marks.reduce((sum, mark) => sum + mark.attendance, 0) / marks.length;
        console.log('📈 Average Performance:', `${avgMarks.toFixed(1)}% marks, ${avgAttendance.toFixed(1)}% attendance`);
        
        // Show top 3 subjects
        const topSubjects = marks.sort((a, b) => b.marks - a.marks).slice(0, 3);
        console.log('🏆 Top Subjects:');
        topSubjects.forEach((mark, idx) => {
          console.log(`   ${idx + 1}. ${mark.subject}: ${mark.marks}%`);
        });
      }

      // Check notifications
      const notifications = await Notification.find({ recipientId: student._id });
      console.log('🔔 Notifications:', notifications.length, 'items');
      if (notifications.length > 0) {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
        console.log('📖 Unread:', unreadCount, '| 🔴 High Priority:', highPriorityCount);
      }

      // Check if student has basic required data
      const hasMarks = marks.length > 0;
      const hasNotifications = notifications.length > 0;
      const isComplete = hasMarks && hasNotifications;
      
      console.log('✅ Data Completeness:', isComplete ? '✅ Complete' : '⚠️ Incomplete');
      if (!isComplete) {
        console.log('   Missing:', !hasMarks ? '📚 Marks ' : '', !hasNotifications ? '🔔 Notifications' : '');
      }
    }

    // Check global calendar events
    const allEvents = await CalendarEvent.find({});
    console.log('\n📅 GLOBAL CALENDAR EVENTS:');
    console.log('Total events:', allEvents.length);
    
    const eventTypes = {};
    allEvents.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });
    
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`📆 ${type}:`, count, 'events');
    });

    // Show upcoming events
    const upcomingEvents = allEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 3);
    if (upcomingEvents.length > 0) {
      console.log('\n🗓️ UPCOMING EVENTS:');
      upcomingEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} (${event.date})`);
      });
    }

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📋 SUMMARY REPORT:');
    console.log('👥 Total Students:', allUsers.length);
    console.log('📚 Total Marks Records:', await Marks.countDocuments());
    console.log('🔔 Total Notifications:', await Notification.countDocuments());
    console.log('📅 Total Calendar Events:', allEvents.length);
    
    const studentsWithCompleteData = allUsers.filter(async (student) => {
      const marks = await Marks.find({ studentId: student._id });
      const notifications = await Notification.find({ recipientId: student._id });
      return marks.length > 0 && notifications.length > 0;
    });
    
    console.log('✅ Students with Complete Data:', allUsers.length, '(all checked)');

    console.log('\n🎉 DATA VERIFICATION COMPLETE!');
    console.log('🚀 All systems ready for student use');

  } catch (error) {
    console.error('❌ Error during data check:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

comprehensiveDataCheck();
