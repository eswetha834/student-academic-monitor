const axios = require('axios');

async function testRawLoginAPI() {
  try {
    console.log('🧪 Testing Raw Login API\n');
    
    const loginData = {
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    };
    
    console.log('Sending request to: http://localhost:5000/api/login');
    console.log('Request body:', JSON.stringify(loginData, null, 2));
    console.log('Request headers: { "Content-Type": "application/json" }\n');
    
    const response = await axios.post('http://localhost:5000/api/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging
      timeout: 10000
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', error.response?.data);
    console.log('Headers:', error.response?.headers);
    
    if (error.code === 'ECONNRESET') {
      console.log('Connection was reset - server might have crashed');
    }
  }
}

testRawLoginAPI();
