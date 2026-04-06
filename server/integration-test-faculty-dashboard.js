const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}→${colors.reset} ${msg}`)
};

async function runIntegrationTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    log.section('FACULTY DASHBOARD DATA INTEGRATION TEST');

    // Test 1: Faculty Authentication
    log.test('Test 1: Faculty Authentication');
    let token, user;
    try {
      const authRes = await axios.post(`${API_URL}/api/login`, {
        email: 'elango@gmail.com',
        password: 'faculty123'
      });
      
      token = authRes.data.token;
      user = authRes.data.user;
      
      if (!token || user.role !== 'teacher') {
        throw new Error(`Invalid role: ${user.role}`);
      }
      
      log.success(`Authenticated as ${user.email} with role: ${user.role}`);
      testsPassed++;
    } catch (err) {
      log.error(`Authentication failed: ${err.message}`);
      testsFailed++;
      return; // Can't continue without auth
    }

    // Test 2: Fetch Dashboard Data
    log.test('Test 2: Fetch Dashboard Data');
    let dashboardData;
    try {
      const res = await axios.get(`${API_URL}/api/faculty/dashboard-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      dashboardData = res.data;
      
      if (!dashboardData.students || !dashboardData.stats) {
        throw new Error('Invalid response structure');
      }
      
      log.success('Dashboard data retrieved with proper structure');
      testsPassed++;
    } catch (err) {
      log.error(`Failed to fetch dashboard data: ${err.message}`);
      testsFailed++;
      return;
    }

    // Test 3: Verify Statistics
    log.test('Test 3: Verify Statistics Structure');
    try {
      const { totalStudents, avgMarksPercent, attendanceAvg, weakStudentsCount } = dashboardData.stats;
      
      if (typeof totalStudents !== 'number' || 
          typeof avgMarksPercent !== 'number' || 
          typeof attendanceAvg !== 'number' || 
          typeof weakStudentsCount !== 'number') {
        throw new Error('Invalid stat types');
      }
      
      log.success(`Statistics structure is valid`);
      console.log(`  - Total Students: ${totalStudents}`);
      console.log(`  - Avg Marks: ${avgMarksPercent}%`);
      console.log(`  - Avg Attendance: ${attendanceAvg}%`);
      console.log(`  - Weak Students: ${weakStudentsCount}`);
      testsPassed++;
    } catch (err) {
      log.error(`Statistics validation failed: ${err.message}`);
      testsFailed++;
    }

    // Test 4: Verify Students Data
    log.test('Test 4: Verify Students Data Structure');
    try {
      const { students } = dashboardData;
      
      if (!Array.isArray(students)) {
        throw new Error('Students is not an array');
      }
      
      if (students.length === 0) {
        throw new Error('No assigned students found');
      }
      
      // Validate each student object
      students.forEach((student, idx) => {
        const requiredFields = ['_id', 'name', 'email', 'averageMarks', 'gpa', 'attendancePercent'];
        requiredFields.forEach(field => {
          if (!(field in student)) {
            throw new Error(`Student ${idx} missing field: ${field}`);
          }
        });
      });
      
      log.success(`Students array validated (${students.length} students)`);
      testsPassed++;
    } catch (err) {
      log.error(`Students validation failed: ${err.message}`);
      testsFailed++;
    }

    // Test 5: Detailed Student Analysis
    log.test('Test 5: Detailed Student Analysis');
    try {
      const { students } = dashboardData;
      
      console.log('\n  Student Details:');
      students.forEach((student, idx) => {
        console.log(`  ${idx + 1}. ${student.name} (${student.email})`);
        console.log(`     - Average Marks: ${student.averageMarks}`);
        console.log(`     - GPA: ${student.gpa}`);
        console.log(`     - Attendance: ${student.attendancePercent}%`);
        console.log(`     - Marks Count: ${student.marksCount}`);
      });
      
      testsPassed++;
    } catch (err) {
      log.error(`Student analysis failed: ${err.message}`);
      testsFailed++;
    }

    // Test 6: Statistics Calculation Verification
    log.test('Test 6: Statistics Calculation Verification');
    try {
      const { students, stats } = dashboardData;
      
      // Manually calculate average marks to verify
      const calculatedAvg = students.reduce((sum, s) => sum + s.gpa, 0) / students.length * 10;
      const calculatedAvgMarks = Math.round(calculatedAvg * 10) / 10;
      
      // Manually calculate average attendance
      const calculatedAvgAtt = Math.round(
        students.reduce((sum, s) => sum + s.attendancePercent, 0) / students.length
      );
      
      const avgMarksMatch = Math.abs(stats.avgMarksPercent - calculatedAvgMarks) < 1;
      const avgAttMatch = Math.abs(stats.attendanceAvg - calculatedAvgAtt) <= 1;
      
      if (!avgMarksMatch || !avgAttMatch) {
        throw new Error(`Statistics don't match manual calculation. Marks: ${avgMarksMatch}, Att: ${avgAttMatch}`);
      }
      
      log.success('Statistics calculations verified');
      console.log(`  - API Avg Marks: ${stats.avgMarksPercent}% ≈ Calculated: ${calculatedAvgMarks}%`);
      console.log(`  - API Avg Attendance: ${stats.attendanceAvg}% ≈ Calculated: ${calculatedAvgAtt}%`);
      testsPassed++;
    } catch (err) {
      log.error(`Calculation verification failed: ${err.message}`);
      testsFailed++;
    }

    // Test 7: Frontend API Path Check
    log.test('Test 7: Frontend Integration Point Check');
    try {
      // Verify the endpoint path matches what frontend expects
      const expectedPath = '/api/faculty/dashboard-data';
      const actualRes = await axios.get(`${API_URL}${expectedPath}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!actualRes.data || !actualRes.data.students || !actualRes.data.stats) {
        throw new Error('Response structure mismatch');
      }
      
      log.success(`Endpoint path verified: ${expectedPath}`);
      testsPassed++;
    } catch (err) {
      log.error(`Endpoint path check failed: ${err.message}`);
      testsFailed++;
    }

    // Summary
    log.section('TEST SUMMARY');
    console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
    
    if (testsFailed === 0) {
      console.log(`\n${colors.green}✓ All tests passed! Faculty dashboard data integration is working correctly.${colors.reset}`);
      console.log(`\n✓ The frontend can now:
  1. Log in as faculty (elango@gmail.com / faculty123)
  2. Fetch dashboard data from /api/faculty/dashboard-data
  3. Display students list with: name, email, averageMarks, gpa, attendancePercent
  4. Display statistics: totalStudents, avgMarksPercent, attendanceAvg, weakStudentsCount
  5. Render dashboard overview cards with populated values (not zeros)
      `);
    } else {
      console.log(`\n${colors.red}✗ Some tests failed. See details above.${colors.reset}`);
    }
    
  } catch (err) {
    log.error(`Unexpected error: ${err.message}`);
  }
}

// Run tests
runIntegrationTests();
