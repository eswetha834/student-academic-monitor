const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const AttendanceRecord = require('./models/AttendanceRecord');
const Role = require('./models/Role');
require('dotenv').config();

// Import the prediction function from server.js
const predictPerformance = (student) => {
  const marks = student.marks || [];
  if (marks.length < 2) {
    return {
      predictedScore: null,
      confidence: 0,
      trend: 'insufficient_data',
      recommendation: 'Need more data for prediction'
    };
  }

  // Sort marks by date (assuming newer marks are at the end)
  const sortedMarks = marks.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  
  // Calculate recent trend (last 3 marks)
  const recentMarks = sortedMarks.slice(-3);
  const avgRecent = recentMarks.reduce((sum, m) => sum + m.marks, 0) / recentMarks.length;
  const avgOverall = marks.reduce((sum, m) => sum + m.marks, 0) / marks.length;
  
  // Determine trend
  let trend = 'stable';
  let trendPercent = 0;
  
  if (recentMarks.length >= 2) {
    const firstRecent = recentMarks[0].marks;
    const lastRecent = recentMarks[recentMarks.length - 1].marks;
    trendPercent = ((lastRecent - firstRecent) / firstRecent) * 100;
    
    if (trendPercent > 5) trend = 'improving';
    else if (trendPercent < -5) trend = 'declining';
  }
  
  // Predict next score based on trend and consistency
  let predictedScore;
  let confidence = 0;
  
  if (trend === 'improving') {
    predictedScore = Math.min(100, avgRecent + (avgRecent * 0.1)); // Add 10% of recent average
    confidence = Math.min(85, 60 + recentMarks.length * 5);
  } else if (trend === 'declining') {
    predictedScore = Math.max(0, avgRecent - (avgRecent * 0.05)); // Subtract 5% of recent average
    confidence = Math.min(80, 50 + recentMarks.length * 5);
  } else {
    predictedScore = avgRecent; // Stable - predict similar to recent average
    confidence = Math.min(75, 55 + recentMarks.length * 5);
  }
  
  // Adjust based on attendance
  const attendance = student.attendance || 0;
  if (attendance < 75) {
    predictedScore *= 0.9; // Reduce prediction if attendance is poor
    confidence -= 10;
  } else if (attendance >= 90) {
    predictedScore *= 1.05; // Boost prediction if attendance is excellent
    confidence += 5;
  }
  
  // Generate recommendation
  let recommendation = '';
  if (predictedScore >= 90) {
    recommendation = 'Excellent performance expected! Keep up the great work.';
  } else if (predictedScore >= 75) {
    recommendation = 'Good performance expected. Continue current study habits.';
  } else if (predictedScore >= 60) {
    recommendation = 'Moderate performance expected. Consider increasing study time.';
  } else if (predictedScore >= 40) {
    recommendation = 'Performance needs improvement. Seek additional help and focus on weak areas.';
  } else {
    recommendation = 'Significant improvement needed. Consider tutoring and study plan changes.';
  }
  
  return {
    predictedScore: Math.round(predictedScore),
    confidence: Math.max(20, Math.min(95, Math.round(confidence))),
    trend,
    trendPercent: Math.round(trendPercent),
    recommendation,
    factors: {
      recentAverage: Math.round(avgRecent),
      overallAverage: Math.round(avgOverall),
      attendanceImpact: attendance < 75 ? 'negative' : attendance >= 90 ? 'positive' : 'neutral',
      dataPoints: marks.length
    }
  };
};

async function testPrediction() {
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

    // Fetch student's marks
    const marks = await Marks.find({ studentId: student._id }).sort({ date: 1 });
    console.log('Marks found:', marks.length);

    // Get attendance records
    const attRecords = await AttendanceRecord.find({ studentId: student._id });
    let attendance = 0;
    if (attRecords.length > 0) {
      const present = attRecords.filter(r => r.status === 'Present').length;
      attendance = Math.round((present / attRecords.length) * 100);
    }
    console.log('Attendance:', attendance + '%');

    // Calculate current GPA
    let totalMarks = 0;
    marks.forEach(m => totalMarks += m.marks);
    let avgMarks = marks.length ? totalMarks / marks.length : 0;
    let gpa = parseFloat((avgMarks / 10).toFixed(2));
    
    // Prepare student data for prediction
    const studentData = {
      ...student.toObject(),
      marks,
      attendance,
      gpa
    };
    
    // Generate prediction
    const prediction = predictPerformance(studentData);
    
    console.log('\n🧠 PREDICTION RESULTS:');
    console.log('========================');
    console.log('Student:', student.name);
    console.log('Current GPA:', gpa);
    console.log('Attendance:', attendance + '%');
    console.log('Total Marks Records:', marks.length);
    console.log('\nPrediction:');
    console.log('- Predicted Score:', prediction.predictedScore + '%');
    console.log('- Confidence:', prediction.confidence + '%');
    console.log('- Trend:', prediction.trend + ' (' + prediction.trendPercent + '%)');
    console.log('- Recommendation:', prediction.recommendation);
    console.log('\nFactors:');
    console.log('- Recent Average:', prediction.factors.recentAverage + '%');
    console.log('- Overall Average:', prediction.factors.overallAverage + '%');
    console.log('- Attendance Impact:', prediction.factors.attendanceImpact);
    console.log('- Data Points:', prediction.factors.dataPoints);

  } catch (error) {
    console.error('Error testing prediction:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testPrediction();
