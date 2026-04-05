const http = require('http');

function testLoginAPIWithRole() {
  console.log('🌐 Testing Login API with Role Parameter');

  // Test with role parameter (like frontend sends)
  const loginDataWithRole = JSON.stringify({
    email: 'google@gmail.com',
    password: 'password',
    role: 'student'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginDataWithRole)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n📡 Response Status: ${res.statusCode}`);

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
          console.log('\n🎉 API LOGIN SUCCESSFUL with role!');
        } else {
          console.log('\n❌ API LOGIN FAILED with role');
        }
      } catch (e) {
        console.log('\n❌ Failed to parse JSON response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  console.log('📤 Sending Request:', loginDataWithRole);
  req.write(loginDataWithRole);
  req.end();
}

testLoginAPIWithRole();
