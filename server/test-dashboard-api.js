const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

async function testDashboardAPI() {
  try {
    // First authenticate as elango@gmail.com to get a token
    console.log('1. Authenticating user...');
    const authRes = await axios.post(`${API_URL}/api/login`, {
      email: 'elango@gmail.com',
      password: 'faculty123'
    });
    
    const token = authRes.data.token;
    console.log('✓ Authentication successful. Token:', token.substring(0, 20) + '...');
    
    // Now call /api/faculty/dashboard-data with the token
    console.log('\n2. Fetching dashboard data...');
    const dashboardRes = await axios.get(`${API_URL}/api/faculty/dashboard-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const { students, stats } = dashboardRes.data;
    
    console.log('\n✓ Dashboard data received!');
    console.log('\nStatistics:');
    console.log(`  Total Students: ${stats.totalStudents}`);
    console.log(`  Average Marks: ${stats.avgMarksPercent}%`);
    console.log(`  Average Attendance: ${stats.attendanceAvg}%`);
    console.log(`  Students Needing Attention: ${stats.weakStudentsCount}`);
    
    console.log('\nAssigned Students:');
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.email})`);
      console.log(`    Avg Marks: ${student.averageMarks}, GPA: ${student.gpa}`);
      console.log(`    Attendance: ${student.attendancePercent}%`);
      console.log(`    Marks Count: ${student.marksCount}, Attendance Count: ${student.attendanceCount}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDashboardAPI();
