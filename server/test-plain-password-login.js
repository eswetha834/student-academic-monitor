const http = require('http');

function testPlainPasswordLogin() {
  console.log('🧪 Testing Login with Plain Password');

  // Test login with plain password
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
    let data = '';
    res.on('data', (chunk) => data += chunk);
    
    res.on('end', () => {
      console.log(`\n📡 Response Status: ${res.statusCode}`);
      
      try {
        const response = JSON.parse(data);
        console.log('📦 Response:', response);
        
        if (response.token) {
          console.log('🎉 LOGIN SUCCESSFUL!');
          console.log('✅ Token received');
          console.log(`👤 User: ${response.user.name} (${response.user.role})`);
        } else {
          console.log('❌ LOGIN FAILED');
          console.log(`🚫 Error: ${response.msg}`);
        }
      } catch (e) {
        console.log('❌ Parse Error:', data);
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

testPlainPasswordLogin();
