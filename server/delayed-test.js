// Test with delay to let server fully initialize
const axios = require('axios');

async function delayedTest() {
  try {
    console.log('⏳ Waiting 5 seconds for server to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
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
  }
}

delayedTest();
