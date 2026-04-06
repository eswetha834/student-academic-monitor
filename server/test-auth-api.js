const axios = require('axios');

(async () => {
  const base = 'http://localhost:5000/api';
  try {
    console.log('Testing registration and login APIs');

    const registerEmail = 'testuser50@example.com';
    const registerRes = await axios.post(`${base}/register`, {
      name: 'Test User 50',
      email: registerEmail,
      password: 'test1234',
      role: 'student'
    });
    console.log('REGISTER RESPONSE', registerRes.status, registerRes.data);

    const loginRes = await axios.post(`${base}/login`, {
      email: registerEmail,
      password: 'test1234',
      role: 'student'
    });
    console.log('LOGIN RESPONSE', loginRes.status, loginRes.data);
  } catch (err) {
    if (err.response) {
      console.error('API ERROR', err.response.status, err.response.data);
    } else {
      console.error('ERROR', err.message);
    }
  }
})();