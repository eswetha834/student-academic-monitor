const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/debug/user-check?email=admin@gmail.com');
    console.log('DEBUG:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('ERROR STATUS:', err.response.status);
      console.error('ERROR DATA:', err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
  }
})();
