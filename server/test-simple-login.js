const axios = require('axios');

// Test with exact same format as frontend
const loginData = {
  email: 'admin@gmail.com',
  password: 'admin123',
  role: 'admin'
};

console.log('Making login request to: http://localhost:5000/api/login');
console.log('Request data:', JSON.stringify(loginData, null, 2));

axios.post('http://localhost:5000/api/login', loginData)
  .then(response => {
    console.log('\n✅ SUCCESS!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  })
  .catch(error => {
    console.log('\n❌ ERROR!');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    
    if (error.response?.status === 400 && error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
    }
  });
