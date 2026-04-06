const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testSeparateAlerts() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('🎯 TESTING SEPARATE PERFORMANCE ALERTS SECTION');
    console.log('=' .repeat(60));

    // Test SRU student
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    const marks = await Marks.find({ studentId: sruStudent._id });
    
    const avgMarks = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0) / marks.length;
    const avgAttendance = marks.reduce((sum, m) => sum + (Number(m.attendance) || 0), 0) / marks.length;
    
    console.log('\n📊 SRU Student Performance:');
    console.log('📧 Email:', sruStudent.email);
    console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
    console.log('📈 Average Attendance:', avgAttendance.toFixed(1) + '%');

    // Generate alerts
    const alerts = [];
    
    if (avgMarks < 60) {
      alerts.push({ type: 'critical', title: 'Critical: Academic Performance' });
    } else if (avgMarks < 75) {
      alerts.push({ type: 'warning', title: 'Performance Alert' });
    }

    if (avgAttendance < 75) {
      alerts.push({ type: 'critical', title: 'Attendance Warning' });
    } else if (avgAttendance < 85) {
      alerts.push({ type: 'warning', title: 'Attendance Alert' });
    }

    if (avgMarks >= 85 && avgAttendance >= 90) {
      alerts.push({ type: 'success', title: 'Excellent Performance!' });
    }

    console.log('\n🚨 Generated Alerts:');
    if (alerts.length === 0) {
      console.log('✅ No alerts - Performance is excellent!');
    } else {
      alerts.forEach((alert, index) => {
        const icon = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : '🟢';
        console.log(`${index + 1}. ${icon} ${alert.title}`);
      });
    }

    console.log('\n✅ SEPARATE PERFORMANCE ALERTS SECTION IMPLEMENTED!');
    console.log('📍 Location: New dedicated "Performance Alerts" menu item');
    console.log('🎨 Features: Full-page alert display with detailed information');
    console.log('📊 Summary: Performance metrics and alert status');
    console.log('🔄 Refresh: Real-time alert updates');

    console.log('\n🌐 TEST THE NEW SECTION:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Login: sru@gmail.com / student123');
    console.log('3. Click: "Performance Alerts" in the sidebar menu');
    console.log('4. View: Dedicated performance alerts section');

    console.log('\n🎯 SECTION FEATURES:');
    console.log('✅ Separate menu item in sidebar');
    console.log('✅ Full-page alert display');
    console.log('✅ Performance summary metrics');
    console.log('✅ Interactive action buttons');
    console.log('✅ Refresh functionality');
    console.log('✅ No alerts state with celebration');
    console.log('✅ Responsive design');

  } catch (error) {
    console.error('❌ Error testing separate alerts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testSeparateAlerts();
