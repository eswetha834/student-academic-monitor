const axios = require('axios');
(async () => {
  try {
    const regBody = { name: 'Test User 12345', email: 'testuser12345@example.com', password: 'test123', role: 'student' };
    const r1 = await axios.post('http://localhost:5000/api/register', regBody);
    console.log('REGISTER', r1.status, r1.data);

    const loginBody = { email: 'testuser12345@example.com', password: 'test123', role: 'student' };
    const r2 = await axios.post('http://localhost:5000/api/login', loginBody);
    console.log('LOGIN', r2.status, r2.data);
  } catch (err) {
    console.error('ERROR', err.response ? err.response.status : err.message, err.response ? err.response.data : 'no resp');
  }
})();