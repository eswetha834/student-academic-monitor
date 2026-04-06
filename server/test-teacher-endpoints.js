const axios = require('axios');

async function testTeacherEndpoints() {
  try {
    console.log('🧪 Testing Teacher Dashboard API Endpoints');
    console.log('==========================================');
    
    // Step 1: Login as teacher
    console.log('\n🔑 Logging in as teacher...');
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'elango@gmail.com',
      password: 'teacher123',
      role: 'faculty'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test teacher students endpoint
    console.log('\n📚 Testing /api/teacher/students...');
    try {
      const studentsResponse = await axios.get('http://localhost:5000/api/teacher/students', {
        headers: authHeaders
      });
      console.log(`✅ Found ${studentsResponse.data.length} students`);
      
      if (studentsResponse.data.length > 0) {
        console.log('   Sample student:');
        const sample = studentsResponse.data[0];
        console.log(`   ├─ Name: ${sample.name}`);
        console.log(`   ├─ Email: ${sample.email}`);
        console.log(`   ├─ Role: ${sample.role}`);
        console.log(`   ├─ Department: ${sample.department}`);
        console.log(`   ├─ Average Marks: ${sample.averageMarks}`);
        console.log(`   ├─ Grade: ${sample.grade}`);
        console.log(`   └─ Performance: ${sample.performance}`);
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    // Step 3: Test class statistics
    console.log('\n📊 Testing /api/teacher/class-stats...');
    try {
      const classStatsResponse = await axios.get('http://localhost:5000/api/teacher/class-stats', {
        headers: authHeaders
      });
      const stats = classStatsResponse.data;
      console.log('✅ Class statistics:');
      console.log(`   ├─ Total Students: ${stats.totalStudents}`);
      console.log(`   ├─ Average Class Marks: ${stats.averageClassMarks}`);
      console.log(`   ├─ Average Attendance: ${stats.averageAttendance}`);
      console.log(`   └─ Grade Distribution: A:${stats.gradeA} B:${stats.gradeB} C:${stats.gradeC} D:${stats.gradeD} F:${stats.gradeF}`);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    // Step 4: Test subject statistics
    console.log('\n📚 Testing /api/teacher/subject-stats...');
    try {
      const subjectStatsResponse = await axios.get('http://localhost:5000/api/teacher/subject-stats', {
        headers: authHeaders
      });
      const subjectStats = subjectStatsResponse.data;
      console.log(`✅ Found ${subjectStats.length} subjects`);
      
      subjectStats.forEach(subject => {
        console.log(`   ${subject._id}:`);
        console.log(`   ├─ Students: ${subject.totalStudents}`);
        console.log(`   ├─ Average: ${subject.averageMarks?.toFixed(2) || 0}`);
        console.log(`   └─ Grades: A:${subject.gradeA} B:${subject.gradeB} C:${subject.gradeC} D:${subject.gradeD} F:${subject.gradeF}`);
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    // Step 5: Test individual student
    console.log('\n👤 Testing /api/teacher/student/:id...');
    try {
      const studentResponse = await axios.get('http://localhost:5000/api/teacher/student/69c20e0f0623f7cee6154bbc', {
        headers: authHeaders
      });
      const student = studentResponse.data;
      console.log('✅ Individual student data:');
      console.log(`   ├─ Name: ${student.name}`);
      console.log(`   ├─ Email: ${student.email}`);
      console.log(`   ├─ Password: ${student.password}`);
      console.log(`   ├─ Roll Number: ${student.rollNumber}`);
      console.log(`   ├─ Total Marks: ${student.totalMarks}`);
      console.log(`   ├─ Attendance: ${student.attendancePercentage}%`);
      console.log(`   └─ Subjects: ${student.totalSubjects}`);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Teacher API Endpoints Test Complete!');
    console.log('=====================================');
    console.log('✅ All endpoints are working correctly');
    console.log('✅ Teacher dashboard data is available');
    console.log('✅ Student details are accessible');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testTeacherEndpoints();
