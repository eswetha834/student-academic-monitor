const axios = require('axios');

async function testAuthUser() {
  try {
    console.log('🧪 Testing Auth User Object...\n');

    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Set up headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test a simple endpoint that shows user info
    const response = await axios.get(
      'http://localhost:5000/api/users',
      { headers }
    );

    console.log('\n✅ Auth successful!');
    console.log('User data available in request');

  } catch (error) {
    console.error('\n❌ Auth test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
  }
}

testAuthUser();
