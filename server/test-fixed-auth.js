const axios = require('axios');

async function testFixedAuth() {
  const apiBase = 'http://localhost:5000/api';
  
  console.log('🧪 TESTING FIXED AUTH SYSTEM\n');
  
  try {
    // 1. Test Registration
    console.log('📝 1. TESTING REGISTRATION');
    console.log('Creating new user: amutha');
    
    const registerData = {
      name: 'amutha',
      email: 'amutha@gmail.com',
      password: 'amutha123',
      role: 'student'
    };
    
    try {
      const registerResponse = await axios.post(`${apiBase}/register`, registerData);
      console.log('✅ Registration SUCCESS:', registerResponse.data);
      console.log('Token received:', !!registerResponse.data.token);
    } catch (regError) {
      if (regError.response?.status === 400 && regError.response?.data?.msg === 'User already exists') {
        console.log('ℹ️  User already exists, proceeding to login test');
      } else {
        console.log('❌ Registration FAILED:', regError.response?.data);
        return;
      }
    }
    
    // 2. Test Login
    console.log('\n🔑 2. TESTING LOGIN');
    console.log('Attempting login with: amutha@gmail.com');
    
    const loginData = {
      email: 'amutha@gmail.com',
      password: 'amutha123',
      role: 'student'
    };
    
    try {
      const loginResponse = await axios.post(`${apiBase}/login`, loginData);
      console.log('✅ Login SUCCESS:', loginResponse.data);
      console.log('Token received:', !!loginResponse.data.token);
      console.log('User role:', loginResponse.data.user.role);
      console.log('User name:', loginResponse.data.user.name);
      
      // 3. Test with existing admin user
      console.log('\n🔑 3. TESTING ADMIN LOGIN');
      const adminLoginData = {
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      };
      
      const adminResponse = await axios.post(`${apiBase}/login`, adminLoginData);
      console.log('✅ Admin Login SUCCESS:', adminResponse.data);
      console.log('Admin role:', adminResponse.data.user.role);
      
    } catch (loginError) {
      console.log('❌ Login FAILED:', loginError.response?.data);
      console.log('Status:', loginError.response?.status);
    }
    
    // 4. Test invalid credentials
    console.log('\n🚫 4. TESTING INVALID CREDENTIALS');
    try {
      const invalidLoginData = {
        email: 'amutha@gmail.com',
        password: 'wrongpassword',
        role: 'student'
      };
      
      await axios.post(`${apiBase}/login`, invalidLoginData);
      console.log('❌ Invalid login should have failed!');
    } catch (invalidError) {
      console.log('✅ Invalid credentials correctly rejected:', invalidError.response?.data);
    }
    
    console.log('\n🎉 ALL TESTS COMPLETED!');
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testFixedAuth();
