const http = require('http');

function testLoginAPI() {
  console.log('🌐 Testing Login API Endpoint');

  // Test with correct credentials
  const loginData = JSON.stringify({
    email: 'google@gmail.com',
    password: 'password'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n📡 Response Status: ${res.statusCode}`);
    console.log(`📋 Response Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📦 Response Body:`, data);
      
      try {
        const response = JSON.parse(data);
        console.log('\n🔍 Parsed Response:');
        console.log('- Message:', response.msg);
        console.log('- Token:', response.token ? 'Present' : 'Missing');
        console.log('- User:', response.user ? response.user.name : 'Missing');
        
        if (response.token) {
          console.log('\n🎉 API LOGIN SUCCESSFUL!');
        } else {
          console.log('\n❌ API LOGIN FAILED');
        }
      } catch (e) {
        console.log('\n❌ Failed to parse JSON response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  console.log('📤 Sending Request:', loginData);
  req.write(loginData);
  req.end();
}

testLoginAPI();
