const axios = require('axios');

async function testManualLogin() {
  try {
    console.log('🔑 Testing manual login to server...');
    
    const loginData = {
      email: 'google@gmail.com',
      password: 'password'
    };
    
    console.log('Sending:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
    if (response.data.token) {
      console.log('🎉 LOGIN SUCCESSFUL!');
      console.log('Token:', response.data.token.substring(0, 20) + '...');
      console.log('User:', response.data.user.name, '-', response.data.user.role);
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('Message:', response.data.msg);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testManualLogin();
