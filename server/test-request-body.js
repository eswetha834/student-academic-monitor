const axios = require('axios');

async function testRequestBody() {
  try {
    console.log('🧪 Testing Request Body Processing\n');
    
    // Test with different formats
    const testCases = [
      {
        name: 'Standard JSON',
        data: { email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'URL Encoded',
        data: 'email=admin@gmail.com&password=admin123&role=admin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      },
      {
        name: 'No Content-Type',
        data: { email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
        headers: {}
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      console.log('Data:', testCase.data);
      console.log('Headers:', testCase.headers);
      
      try {
        const response = await axios.post('http://localhost:5000/api/login', testCase.data, {
          headers: testCase.headers,
          timeout: 5000
        });
        console.log('✅ SUCCESS:', response.status);
      } catch (error) {
        console.log('❌ FAILED:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRequestBody();
