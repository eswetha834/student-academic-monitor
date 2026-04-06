const axios = require('axios');

(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });

    const token = login.data.token;
    console.log('token:', token ? 'received' : 'missing');

    const response = await axios.get('http://localhost:5000/api/faculty/predictions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('status', response.status);
    console.log('data', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('response status', error.response.status);
      console.error('response data', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('error', error.message);
    }
  }
})();