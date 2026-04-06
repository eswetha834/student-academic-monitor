const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/register', {
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('REGISTER RESULT', res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.error('REGISTER FAIL', err.response.status, err.response.data);
    } else {
      console.error('REGISTER ERR', err.message);
    }
  }
})();