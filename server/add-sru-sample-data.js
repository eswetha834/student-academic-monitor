const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
require('dotenv').config();

async function addSRUSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find the SRU user
    const sruUser = await User.findOne({ email: 'sru@gmail.com' });
    
    if (!sruUser) {
      console.log('❌ SRU user not found');
      return;
    }

    console.log('✅ Found SRU user:', sruUser.name);

    // Add sample marks if they don't exist
    const existingMarks = await Marks.find({ studentId: sruUser._id });
    console.log('Existing marks count:', existingMarks.length);

    if (existingMarks.length === 0) {
      const sampleMarks = [
        {
          studentId: sruUser._id,
          subject: 'Mathematics',
          examType: 'Internal Assessment',
          marks: 85,
          attendance: 95,
          suggestion: 'Good performance, keep practicing complex problems'
        },
        {
          studentId: sruUser._id,
          subject: 'Physics',
          examType: 'Internal Assessment', 
          marks: 78,
          attendance: 92,
          suggestion: 'Focus on problem solving and numerical practice'
        },
        {
          studentId: sruUser._id,
          subject: 'Chemistry',
          examType: 'Mid-term',
          marks: 82,
          attendance: 88,
          suggestion: 'Good understanding of concepts, work on organic chemistry'
        },
        {
          studentId: sruUser._id,
          subject: 'Data Structures',
          examType: 'Internal Assessment',
          marks: 90,
          attendance: 96,
          suggestion: 'Excellent performance, continue with advanced topics'
        },
        {
          studentId: sruUser._id,
          subject: 'Database Management',
          examType: 'Internal Assessment',
          marks: 87,
          attendance: 94,
          suggestion: 'Good grasp of SQL concepts, practice complex queries'
        },
        {
          studentId: sruUser._id,
          subject: 'Computer Networks',
          examType: 'Quiz',
          marks: 75,
          attendance: 90,
          suggestion: 'Review networking protocols and OSI model'
        }
      ];

      await Marks.insertMany(sampleMarks);
      console.log('✅ Added 6 sample marks for SRU student');
    }

    // Add sample notifications
    const existingNotifications = await Notification.find({ recipientId: sruUser._id });
    if (existingNotifications.length === 0) {
      const sampleNotifications = [
        {
          recipientId: sruUser._id,
          title: 'Assignment Due',
          message: 'Data Structures assignment due next Friday. Please submit on time.',
          type: 'deadline',
          priority: 'high'
        },
        {
          recipientId: sruUser._id,
          title: 'Exam Schedule',
          message: 'Mid-term examinations start from next Monday. Check the schedule.',
          type: 'reminder',
          priority: 'medium'
        },
        {
          recipientId: sruUser._id,
          title: 'Library Reminder',
          message: 'Return the borrowed books before the due date to avoid fines.',
          type: 'reminder',
          priority: 'low'
        },
        {
          recipientId: sruUser._id,
          title: 'Performance Alert',
          message: 'Your attendance in Physics is below 75%. Please improve your attendance.',
          type: 'attendance_low',
          priority: 'high'
        }
      ];

      await Notification.insertMany(sampleNotifications);
      console.log('✅ Added 4 sample notifications');
    }

    // Add sample calendar events
    const existingEvents = await CalendarEvent.find({});
    if (existingEvents.length === 0) {
      const sampleEvents = [
        {
          title: 'Mathematics Mid-term',
          description: 'Mathematics mid-term examination',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now in YYYY-MM-DD format
          type: 'Exam'
        },
        {
          title: 'Data Structures Lab',
          description: 'Practical session for Data Structures',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          type: 'Assignment'
        },
        {
          title: 'Guest Lecture',
          description: 'Industry expert talk on Cloud Computing',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
          type: 'Notice'
        }
      ];

      await CalendarEvent.insertMany(sampleEvents);
      console.log('✅ Added 3 sample calendar events');
    }

    // Display summary
    const finalMarks = await Marks.find({ studentId: sruUser._id });
    const finalNotifications = await Notification.find({ recipientId: sruUser._id });
    const finalEvents = await CalendarEvent.find({});

    console.log('\n📊 SRU Student Data Summary:');
    console.log('📚 Marks:', finalMarks.length, 'subjects');
    console.log('🔔 Notifications:', finalNotifications.length, 'items');
    console.log('📅 Calendar Events:', finalEvents.length, 'events');
    
    console.log('\n📈 Subject Performance:');
    finalMarks.forEach((mark, index) => {
      console.log(`${index + 1}. ${mark.subject}: ${mark.marks}% (Attendance: ${mark.attendance}%)`);
    });

    console.log('\n🎉 SRU student account is now fully set up with sample data!');
    console.log('📧 Login: sru@gmail.com');
    console.log('🔑 Password: sru123');

  } catch (error) {
    console.error('❌ Error adding SRU sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addSRUSampleData();
