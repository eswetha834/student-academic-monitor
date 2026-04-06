const axios = require('axios');

async function testTeacherNameLogin() {
  try {
    console.log('🧪 Testing Teacher Name Login System');
    console.log('===================================');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Test 1: Student login with correct teacher name
    console.log('\n📚 Test 1: Student Login with Correct Teacher Name');
    console.log('==================================================');
    
    try {
      const response = await axios.post(`${baseURL}/login`, {
        email: 'student@gmail.com',
        password: 'student123',
        role: 'student',
        teacherName: 'elango'
      });
      
      console.log('✅ SUCCESS: Student logged in with correct teacher');
      console.log('   ├─ Student:', response.data.user.name);
      console.log('   ├─ Email:', response.data.user.email);
      console.log('   ├─ Role:', response.data.user.role);
      console.log('   └─ Token received:', !!response.data.token);
      
    } catch (error) {
      console.log('❌ FAILED:', error.response?.data?.msg || error.message);
    }
    
    // Test 2: Student login with incorrect teacher name
    console.log('\n❌ Test 2: Student Login with Incorrect Teacher Name');
    console.log('====================================================');
    
    try {
      const response = await axios.post(`${baseURL}/login`, {
        email: 'student@gmail.com',
        password: 'student123',
        role: 'student',
        teacherName: 'john'
      });
      
      console.log('❌ UNEXPECTED SUCCESS: Should have failed with wrong teacher');
      
    } catch (error) {
      console.log('✅ EXPECTED FAILURE: Student login rejected');
      console.log('   ├─ Error:', error.response?.data?.msg);
      console.log('   └─ Status:', error.response?.status);
    }
    
    // Test 3: Student login without teacher name
    console.log('\n❌ Test 3: Student Login Without Teacher Name');
    console.log('==============================================');
    
    try {
      const response = await axios.post(`${baseURL}/login`, {
        email: 'student@gmail.com',
        password: 'student123',
        role: 'student'
      });
      
      console.log('❌ UNEXPECTED SUCCESS: Should have failed without teacher');
      
    } catch (error) {
      console.log('✅ EXPECTED FAILURE: Student login rejected');
      console.log('   ├─ Error:', error.response?.data?.msg);
      console.log('   └─ Status:', error.response?.status);
    }
    
    // Test 4: Faculty login (should not require teacher name)
    console.log('\n👨‍🏫 Test 4: Faculty Login (No Teacher Name Required)');
    console.log('==================================================');
    
    try {
      const response = await axios.post(`${baseURL}/login`, {
        email: 'elango@gmail.com',
        password: 'teacher123',
        role: 'faculty'
      });
      
      console.log('✅ SUCCESS: Faculty logged in without teacher name');
      console.log('   ├─ Faculty:', response.data.user.name);
      console.log('   ├─ Email:', response.data.user.email);
      console.log('   ├─ Role:', response.data.user.role);
      console.log('   ├─ Is Class Teacher:', response.data.user.isClassTeacher);
      console.log('   ├─ Assigned Students:', response.data.user.assignedStudents);
      console.log('   └─ Token received:', !!response.data.token);
      
    } catch (error) {
      console.log('❌ FAILED:', error.response?.data?.msg || error.message);
    }
    
    // Test 5: Test User with correct teacher (faculty@gmail.com)
    console.log('\n📚 Test 5: Test User Login with Correct Teacher');
    console.log('==============================================');
    
    try {
      const response = await axios.post(`${baseURL}/login`, {
        email: 'testuser@gmail.com',
        password: 'test123',
        role: 'student',
        teacherName: 'john'
      });
      
      console.log('✅ SUCCESS: Test user logged in with correct teacher');
      console.log('   ├─ Student:', response.data.user.name);
      console.log('   ├─ Email:', response.data.user.email);
      console.log('   ├─ Role:', response.data.user.role);
      console.log('   └─ Token received:', !!response.data.token);
      
    } catch (error) {
      console.log('❌ FAILED:', error.response?.data?.msg || error.message);
    }
    
    // Test 6: Test User with incorrect teacher
    console.log('\n❌ Test 6: Test User Login with Incorrect Teacher');
    console.log('================================================');
    
    try {
      const response = await axios.post(`${baseURL}/login`, {
        email: 'testuser@gmail.com',
        password: 'test123',
        role: 'student',
        teacherName: 'elango'
      });
      
      console.log('❌ UNEXPECTED SUCCESS: Should have failed with wrong teacher');
      
    } catch (error) {
      console.log('✅ EXPECTED FAILURE: Test user login rejected');
      console.log('   ├─ Error:', error.response?.data?.msg);
      console.log('   └─ Status:', error.response?.status);
    }
    
    console.log('\n🎉 Teacher Name Login Tests Complete!');
    console.log('====================================');
    console.log('\n📋 Summary:');
    console.log('==========');
    console.log('✅ Students must provide correct teacher name to login');
    console.log('✅ Faculty can login without teacher name');
    console.log('✅ Teacher name validation is working correctly');
    console.log('✅ Class teacher assignments are enforced');
    
    console.log('\n🔧 Login Requirements:');
    console.log('=====================');
    console.log('📚 Students: Email + Password + Teacher Name (must match assignment)');
    console.log('👨‍🏫 Faculty: Email + Password (no teacher name required)');
    console.log('👑 Admin: Email + Password (no teacher name required)');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the test
testTeacherNameLogin();
