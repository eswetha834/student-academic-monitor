const http = require('http');

function testRequestBody() {
  console.log('🌐 Testing Request Body Reception');

  // Test different payload formats
  const testCases = [
    {
      name: 'Standard JSON',
      payload: JSON.stringify({
        email: 'google@gmail.com',
        password: 'password'
      })
    },
    {
      name: 'With role',
      payload: JSON.stringify({
        email: 'google@gmail.com',
        password: 'password',
        role: 'student'
      })
    },
    {
      name: 'Uppercase email',
      payload: JSON.stringify({
        email: 'GOOGLE@gmail.com',
        password: 'password'
      })
    },
    {
      name: 'With spaces',
      payload: JSON.stringify({
        email: ' google@gmail.com ',
        password: 'password'
      })
    }
  ];

  testCases.forEach((testCase, index) => {
    setTimeout(() => {
      console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
      
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testCase.payload)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          try {
            const response = JSON.parse(data);
            console.log(`Response: ${response.msg}`);
            if (response.token) {
              console.log(`✅ SUCCESS - Token received`);
            } else {
              console.log(`❌ FAILED - No token`);
            }
          } catch (e) {
            console.log(`❌ Parse Error: ${data}`);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request Error:', error.message);
      });

      console.log(`Sending: ${testCase.payload}`);
      req.write(testCase.payload);
      req.end();
    }, index * 1500); // 1.5 second delay between tests
  });
}

testRequestBody();
