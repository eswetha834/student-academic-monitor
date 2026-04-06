// Simple test to check login endpoint
const http = require('http');

const loginData = JSON.stringify({
  email: 'faculty@test.com',
  password: 'faculty123'
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
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed:', parsed);
    } catch (e) {
      console.log('Not JSON:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(loginData);
req.end();
