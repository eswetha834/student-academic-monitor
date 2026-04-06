const axios = require('axios');
(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/login', { email: 'elango@gmail.com', password: 'faculty123'});
    const token = login.data.token;
    const students = await axios.get('http://localhost:5000/api/faculty/dashboard-data', { headers: { Authorization: 'Bearer ' + token } });
    const id = students.data.students[0]._id;
    const det = await axios.get('http://localhost:5000/api/teacher/student/' + id, { headers: { Authorization: 'Bearer ' + token } });
    console.log('teacher/student response type:', typeof det.data);
    console.log('keys:', Object.keys(det.data));
    console.log('partial:', JSON.stringify(det.data, null, 2).substring(0, 1500));
  } catch (e) {
    console.error('Error', e.response && e.response.data ? e.response.data : e.message);
  }
})();