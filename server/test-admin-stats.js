const mongoose = require('mongoose');
require('dotenv').config();

async function testAdminStats() {
  try {
    console.log('📊 Testing Admin Stats Endpoint');
    console.log('==================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    // Test the admin stats endpoint
    console.log('\n🔍 Testing: GET /api/admin/stats');
    
    // First login as admin to get token
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Admin login successful');
      
      // Now test the stats endpoint
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('✅ Admin stats endpoint working!');
        console.log('📋 Stats Results:');
        console.log(`   Total Students: ${stats.totalStudents}`);
        console.log(`   Total Teachers: ${stats.totalTeachers}`);
        console.log(`   Total Courses: ${stats.totalCourses}`);
        console.log(`   Average GPA: ${stats.avgGpa}`);
        console.log(`   Average Attendance: ${stats.avgAttendance}%`);
        
        if (stats.totalStudents === 0) {
          console.log('\n❌ Issue: Still showing 0 students');
          console.log('🔧 Need to check why student count is 0');
        } else {
          console.log('\n✅ Success: Student count is working');
          console.log('🎯 Admin dashboard should show correct student count');
        }
        
      } else {
        console.log('❌ Stats endpoint failed:', statsResponse.status, statsResponse.statusText);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAdminStats();
