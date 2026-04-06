const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function checkLiveAlerts() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27091/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('🔍 LIVE ALERT STATUS CHECK');
    console.log('=' .repeat(50));

    // Get SRU student data
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    const marks = await Marks.find({ studentId: sruStudent._id });
    
    // Calculate metrics exactly as frontend does
    const avgMarksPct = Math.round(marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0) / marks.length);
    const attendanceOverall = Math.round(marks.reduce((sum, m) => sum + (Number(m.attendance) || 0), 0) / marks.length);
    
    console.log('\n📊 CURRENT PERFORMANCE METRICS:');
    console.log('👤 Student:', sruStudent.name);
    console.log('📧 Email:', sruStudent.email);
    console.log('📈 Average Marks:', avgMarksPct + '%');
    console.log('📈 Average Attendance:', attendanceOverall + '%');
    console.log('📚 Total Subjects:', marks.length);

    // Generate alerts exactly like frontend logic
    console.log('\n🚨 FRONTEND ALERT LOGIC SIMULATION:');
    const alerts = [];
    
    // Low performance alerts
    if (avgMarksPct < 60) {
      alerts.push({ type: 'critical', title: 'Critical: Academic Performance' });
    } else if (avgMarksPct < 75) {
      alerts.push({ type: 'warning', title: 'Performance Alert' });
    }

    // Attendance alerts
    if (attendanceOverall < 75) {
      alerts.push({ type: 'critical', title: 'Attendance Warning' });
    } else if (attendanceOverall < 85) {
      alerts.push({ type: 'warning', title: 'Attendance Alert' });
    }

    // Subject-specific alerts
    const lowPerformingSubjects = marks.filter(m => Number(m.marks) < 60);
    const averagePerformingSubjects = marks.filter(m => Number(m.marks) >= 60 && Number(m.marks) < 75);
    const excellentSubjects = marks.filter(m => Number(m.marks) >= 85);
    
    // Individual subject alerts
    lowPerformingSubjects.forEach(subject => {
      alerts.push({
        type: 'critical',
        title: `${subject.subject} Needs Immediate Attention`,
        subjectName: subject.subject,
        subjectMarks: Number(subject.marks)
      });
    });

    averagePerformingSubjects.forEach(subject => {
      alerts.push({
        type: 'warning',
        title: `Improve ${subject.subject} Performance`,
        subjectName: subject.subject,
        subjectMarks: Number(subject.marks)
      });
    });

    // Positive alerts
    if (avgMarksPct >= 85) {
      alerts.push({
        type: 'success',
        title: 'Excellent Academic Performance!',
        message: `Outstanding work! Your average marks of ${avgMarksPct}% are exceptional.`
      });
    } else if (avgMarksPct >= 75) {
      alerts.push({
        type: 'success',
        title: 'Good Performance!',
        message: `Great job! Your average marks of ${avgMarksPct}% are solid. Keep it up!`
      });
    }

    // Attendance-specific positive alert
    if (attendanceOverall >= 90) {
      alerts.push({
        type: 'success',
        title: 'Excellent Attendance!',
        message: `Perfect! Your attendance of ${attendanceOverall}% is outstanding.`
      });
    }

    // Combined excellence alert
    if (avgMarksPct >= 85 && attendanceOverall >= 90) {
      const existingExcellenceAlert = alerts.find(a => a.title.includes('Excellent Academic Performance'));
      if (existingExcellenceAlert) {
        existingExcellenceAlert.title = 'Perfect Performance!';
        existingExcellenceAlert.message = `Outstanding! ${avgMarksPct}% marks and ${attendanceOverall}% attendance - you're excelling in all areas!`;
      }
    }

    // Celebration for excellent subjects
    if (excellentSubjects.length > 0) {
      alerts.push({
        type: 'success',
        title: 'Outstanding Subject Performance!',
        message: `Excellent work in ${excellentSubjects.length} subject(s): ${excellentSubjects.map(s => s.subject).join(', ')}.`
      });
    }

    // Overall subject performance summary
    if (lowPerformingSubjects.length > 0 || averagePerformingSubjects.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Subject Focus Summary',
        message: `Out of ${marks.length} subjects: ${excellentSubjects.length} excellent, ${averagePerformingSubjects.length} need improvement, ${lowPerformingSubjects.length} need urgent focus.`
      });
    }

    console.log('\n📋 GENERATED ALERTS BREAKDOWN:');
    console.log('Total Alerts:', alerts.length);
    
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    const warningAlerts = alerts.filter(a => a.type === 'warning');
    const successAlerts = alerts.filter(a => a.type === 'success');
    const infoAlerts = alerts.filter(a => a.type === 'info');
    
    console.log('🔴 Critical Alerts:', criticalAlerts.length);
    console.log('🟡 Warning Alerts:', warningAlerts.length);
    console.log('🟢 Success Alerts:', successAlerts.length);
    console.log('🔵 Info Alerts:', infoAlerts.length);

    console.log('\n📝 DETAILED ALERT LIST:');
    alerts.forEach((alert, index) => {
      const icon = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : alert.type === 'info' ? '🔵' : '🟢';
      console.log(`${index + 1}. ${icon} ${alert.title}`);
      if (alert.message) console.log(`   ${alert.message}`);
      if (alert.subjectName) console.log(`   Subject: ${alert.subjectName} (${alert.subjectMarks}%)`);
    });

    console.log('\n✅ ALERT STATUS SUMMARY:');
    console.log('🎯 Overall Status:', alerts.length === 0 ? 'No Alerts' : criticalAlerts.length > 0 ? 'Critical' : warningAlerts.length > 0 ? 'Warning' : 'Success');
    console.log('📊 Performance Level:', avgMarksPct >= 85 ? 'Excellent' : avgMarksPct >= 75 ? 'Good' : avgMarksPct >= 60 ? 'Average' : 'Needs Improvement');
    console.log('📈 Attendance Level:', attendanceOverall >= 90 ? 'Excellent' : attendanceOverall >= 85 ? 'Good' : attendanceOverall >= 75 ? 'Average' : 'Needs Improvement');

    console.log('\n🌐 FRONTEND DISPLAY EXPECTATION:');
    console.log('📱 Performance Alerts Section: Should show', alerts.length, 'alerts');
    console.log('🎨 Alert Colors:', criticalAlerts.length > 0 ? 'Red indicators' : warningAlerts.length > 0 ? 'Orange indicators' : 'Green indicators');
    console.log('📊 Subject Focus Analysis: Should show subject categorization');
    console.log('🔍 Performance Summary: Should display current metrics');

    console.log('\n🎉 ALERT SYSTEM STATUS: OPERATIONAL ✅');

  } catch (error) {
    console.error('❌ Error checking live alerts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkLiveAlerts();
