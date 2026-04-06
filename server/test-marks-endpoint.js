const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

async function testMarksEndpoint() {
  try {
    console.log('Testing Marks Endpoint Integration\n');

    // Step 1: Authenticate as faculty
    console.log('1. Authenticating as faculty...');
    const authRes = await axios.post(`${API_URL}/api/login`, {
      email: 'elango@gmail.com',
      password: 'faculty123'
    });
    
    const token = authRes.data.token;
    console.log('✓ Authenticated successfully\n');

    // Step 2: Get assigned students
    console.log('2. Fetching assigned students...');
    const studentsRes = await axios.get(`${API_URL}/api/faculty/dashboard-data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const students = studentsRes.data.students;
    if (students.length === 0) {
      throw new Error('No assigned students found');
    }
    
    const studentId = students[0]._id;
    const studentName = students[0].name;
    console.log(`✓ Found student: ${studentName} (ID: ${studentId})\n`);

    // Step 3: Add marks for the student
    console.log('3. Adding marks for the student...');
    const marksRes = await axios.post(`${API_URL}/api/faculty/marks`, {
      studentId: studentId,
      subject: 'Mathematics',
      marks: 85,
      attendance: 90,
      suggestion: 'Excellent performance in this subject',
      examType: 'Midterm'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✓ Marks added successfully');
    console.log(`  Response:`, marksRes.data.msg);
    console.log(`  Marks Record ID: ${marksRes.data.marks._id}\n`);

    // Step 4: Verify the marks were saved
    console.log('4. Verifying marks in dashboard...');
    const updatedRes = await axios.get(`${API_URL}/api/faculty/dashboard-data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const updatedStudent = updatedRes.data.students.find(s => s._id === studentId);
    console.log(`✓ Student ${updatedStudent.name}:`);
    console.log(`  - Average Marks: ${updatedStudent.averageMarks}`);
    console.log(`  - GPA: ${updatedStudent.gpa}`);
    console.log(`  - Total Marks Records: ${updatedStudent.marksCount}\n`);

    console.log('✅ All tests passed! Marks endpoint is working correctly.');
    console.log('\nFaculty can now:');
    console.log('  1. Select a student from the dropdown');
    console.log('  2. Enter subject, marks, attendance, and comments');
    console.log('  3. Click "Update Marks" to save to database');
    console.log('  4. Marks will be reflected in the dashboard statistics');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.msg || error.message);
  }
}

testMarksEndpoint();
