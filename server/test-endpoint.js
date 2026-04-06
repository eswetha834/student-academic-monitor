// Test the faculty predictions endpoint
const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Testing faculty predictions endpoint...');
    
    // First, login as faculty to get a token
    console.log('🔐 Logging in as faculty...');
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'faculty@test.com',
      password: 'faculty123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Now test the predictions endpoint
    console.log('🔮 Testing predictions endpoint...');
    const predictionsResponse = await axios.get('http://localhost:5000/api/faculty/predictions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Predictions endpoint working!');
    console.log('📊 Predictions data:', predictionsResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - checking credentials...');
    } else if (error.response?.status === 403) {
      console.log('🚫 Access denied - checking permissions...');
    } else if (error.response?.status === 500) {
      console.log('💥 Server error - checking server logs...');
    }
  }
}

testEndpoint();
