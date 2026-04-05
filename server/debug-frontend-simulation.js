const http = require('http');

function simulateFrontendLogin() {
  console.log('🎭 Simulating Exact Frontend Login Request');

  // Test different scenarios exactly like frontend
  const scenarios = [
    {
      name: 'Correct Role (Student)',
      data: { email: 'google@gmail.com', password: 'password', role: 'student' }
    },
    {
      name: 'Wrong Role (Faculty)',
      data: { email: 'google@gmail.com', password: 'password', role: 'faculty' }
    },
    {
      name: 'Wrong Role (Admin)',
      data: { email: 'google@gmail.com', password: 'password', role: 'admin' }
    },
    {
      name: 'No Role',
      data: { email: 'google@gmail.com', password: 'password' }
    }
  ];

  scenarios.forEach((scenario, index) => {
    setTimeout(() => {
      console.log(`\n--- Test ${index + 1}: ${scenario.name} ---`);
      
      const loginData = JSON.stringify(scenario.data);
      
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
          try {
            const response = JSON.parse(data);
            console.log(`Status: ${res.statusCode} - ${response.msg}`);
            console.log(`Token: ${response.token ? '✅ Present' : '❌ Missing'}`);
            console.log(`User: ${response.user ? response.user.name : '❌ Missing'}`);
          } catch (e) {
            console.log(`❌ Parse Error: ${data}`);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request Error:', error.message);
      });

      req.write(loginData);
      req.end();
    }, index * 1000); // 1 second delay between tests
  });
}

simulateFrontendLogin();
