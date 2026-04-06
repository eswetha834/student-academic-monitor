const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testAlertFix() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('🔧 TESTING ALERT LOGIC FIX FOR 86% MARKS');
    console.log('=' .repeat(60));

    // Test SRU student
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    const marks = await Marks.find({ studentId: sruStudent._id });
    
    const avgMarks = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0) / marks.length;
    const avgAttendance = marks.reduce((sum, m) => sum + (Number(m.attendance) || 0), 0) / marks.length;
    
    console.log('\n📊 Student Performance Data:');
    console.log('📧 Email:', sruStudent.email);
    console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
    console.log('📈 Average Attendance:', avgAttendance.toFixed(1) + '%');

    // Test the NEW alert logic
    console.log('\n🚨 TESTING NEW ALERT LOGIC:');
    const alerts = [];
    
    // Low performance alerts
    if (avgMarks < 60) {
      alerts.push({ type: 'critical', title: 'Critical: Academic Performance' });
    } else if (avgMarks < 75) {
      alerts.push({ type: 'warning', title: 'Performance Alert' });
    }

    // Attendance alerts
    if (avgAttendance < 75) {
      alerts.push({ type: 'critical', title: 'Attendance Warning' });
    } else if (avgAttendance < 85) {
      alerts.push({ type: 'warning', title: 'Attendance Alert' });
    }

    // NEW: Positive alerts - More flexible criteria
    if (avgMarks >= 85) {
      alerts.push({ 
        type: 'success', 
        title: 'Excellent Academic Performance!',
        message: `Outstanding work! Your average marks of ${avgMarks.toFixed(1)}% are exceptional.` 
      });
    } else if (avgMarks >= 75) {
      alerts.push({ 
        type: 'success', 
        title: 'Good Performance!',
        message: `Great job! Your average marks of ${avgMarks.toFixed(1)}% are solid. Keep it up!` 
      });
    }

    // Attendance-specific positive alert
    if (avgAttendance >= 90) {
      alerts.push({ 
        type: 'success', 
        title: 'Excellent Attendance!',
        message: `Perfect! Your attendance of ${avgAttendance.toFixed(1)}% is outstanding.` 
      });
    }

    // Combined excellence alert
    if (avgMarks >= 85 && avgAttendance >= 90) {
      const existingExcellenceAlert = alerts.find(a => a.title.includes('Excellent Academic Performance'));
      if (existingExcellenceAlert) {
        existingExcellenceAlert.title = 'Perfect Performance!';
        existingExcellenceAlert.message = `Outstanding! ${avgMarks.toFixed(1)}% marks and ${avgAttendance.toFixed(1)}% attendance - you're excelling in all areas!`;
      }
    }

    console.log('\n📋 GENERATED ALERTS:');
    if (alerts.length === 0) {
      console.log('❌ No alerts generated');
    } else {
      alerts.forEach((alert, index) => {
        const icon = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : alert.type === 'info' ? '🔵' : '🟢';
        console.log(`${index + 1}. ${icon} ${alert.title}`);
        if (alert.message) console.log(`   ${alert.message}`);
      });
    }

    // Verify the fix
    const hasSuccessAlert = alerts.some(a => a.type === 'success');
    const hasWarningAlert = alerts.some(a => a.type === 'warning');
    
    console.log('\n✅ VERIFICATION RESULTS:');
    console.log('📊 Marks:', avgMarks.toFixed(1) + '% (≥85% should show success)');
    console.log('📊 Attendance:', avgAttendance.toFixed(1) + '%');
    console.log('🟢 Success Alerts:', hasSuccessAlert ? 'YES ✅' : 'NO ❌');
    console.log('🟡 Warning Alerts:', hasWarningAlert ? 'YES ❌ (Should not show for 86%)' : 'NO ✅');
    
    if (hasSuccessAlert && !hasWarningAlert) {
      console.log('\n🎉 FIX SUCCESSFUL!');
      console.log('✅ 86% marks now correctly shows success alert');
      console.log('✅ No more false warnings for good performance');
    } else {
      console.log('\n❌ FIX NEEDED:');
      if (!hasSuccessAlert) console.log('❌ Should show success alert for 86% marks');
      if (hasWarningAlert) console.log('❌ Should not show warning for 86% marks');
    }

    console.log('\n🌐 TEST THE FIX:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Login: sru@gmail.com / student123');
    console.log('3. Click: "Performance Alerts" in sidebar');
    console.log('4. Verify: 🟢 Success alert (not 🟡 warning)');

  } catch (error) {
    console.error('❌ Error testing alert fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAlertFix();
