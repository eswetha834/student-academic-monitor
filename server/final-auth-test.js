const axios = require('axios');

async function finalAuthTest() {
  console.log('🔍 FINAL AUTHENTICATION TEST\n');
  
  // Test 1: Student login (working)
  console.log('1. Testing Student Login:');
  try {
    const studentResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'amutha@gmail.com',
      password: 'amutha123',
      role: 'student'
    });
    console.log('✅ Student Login SUCCESS:', studentResponse.status);
  } catch (error) {
    console.log('❌ Student Login FAILED:', error.response?.data);
  }
  
  // Test 2: Admin login (failing)
  console.log('\n2. Testing Admin Login:');
  try {
    const adminResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin Login SUCCESS:', adminResponse.status);
    console.log('Admin user data:', adminResponse.data.user);
  } catch (error) {
    console.log('❌ Admin Login FAILED:', error.response?.status, error.response?.data);
  }
  
  // Test 3: Check if admin user exists in database
  console.log('\n3. Checking Admin User in Database:');
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    
    const admin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    if (admin) {
      console.log('✅ Admin user found in database');
      console.log('- Name:', admin.name);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- Has password:', !!admin.password);
      console.log('- Password is hashed:', admin.password.startsWith('$2'));
      
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('admin123', admin.password);
      console.log('- Password matches:', isMatch);
    } else {
      console.log('❌ Admin user not found in database');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Database check error:', error.message);
  }
  
  // Test 4: Try login without role
  console.log('\n4. Testing Admin Login without role:');
  try {
    const adminResponseNoRole = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    console.log('✅ Admin Login (no role) SUCCESS:', adminResponseNoRole.status);
  } catch (error) {
    console.log('❌ Admin Login (no role) FAILED:', error.response?.status, error.response?.data);
  }
  
  console.log('\n🎯 CONCLUSION:');
  console.log('If student login works but admin login fails,');
  console.log('the issue is likely in the login route logic.');
  console.log('Check server console logs for detailed debugging.');
}

finalAuthTest();
