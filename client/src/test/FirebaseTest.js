import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseAcademicService } from '../services/firebaseService';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const FirebaseTest = () => {
  const { currentUser, login, signup, logout } = useFirebase();
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = {};

    try {
      // Test 1: Authentication
      results.auth = await testAuthentication();
      
      // Test 2: User Profile
      results.userProfile = await testUserProfile();
      
      // Test 3: Marks Management
      results.marks = await testMarksManagement();
      
      // Test 4: Goals Management
      results.goals = await testGoalsManagement();
      
      // Test 5: Study Sessions
      results.studySessions = await testStudySessions();
      
      // Test 6: Performance Stats
      results.performanceStats = await testPerformanceStats();

    } catch (error) {
      console.error('Test suite error:', error);
      results.error = error.message;
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testAuthentication = async () => {
    try {
      // Test login with existing user or create new one
      const testEmail = 'test@academicmonitor.com';
      const testPassword = 'test123456';
      
      try {
        await login(testEmail, testPassword);
      } catch (error) {
        // If login fails, try to create user
        await signup(testEmail, testPassword, {
          name: 'Test User',
          role: 'student',
          department: 'Computer Science',
          semester: '4th',
          rollNumber: 'TEST001'
        });
      }
      
      return { status: 'success', message: 'Authentication working' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const testUserProfile = async () => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test getting user profile
      const profile = await firebaseAcademicService.getUserProfile(currentUser.uid);
      
      // Test updating user profile
      await firebaseAcademicService.updateUserProfile(currentUser.uid, {
        lastLogin: new Date().toISOString()
      });
      
      return { status: 'success', message: 'User profile operations working' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const testMarksManagement = async () => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test adding marks
      const marksId = await firebaseAcademicService.addMarks({
        studentId: currentUser.uid,
        subject: 'Test Mathematics',
        marks: 85,
        attendance: 90,
        semester: '4th'
      });
      
      // Test getting marks
      const marks = await firebaseAcademicService.getStudentMarks(currentUser.uid);
      
      // Test updating marks
      await firebaseAcademicService.updateMarks(marksId, {
        marks: 88,
        attendance: 92
      });
      
      return { status: 'success', message: `Marks management working (${marks.length} records)` };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const testGoalsManagement = async () => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test adding goal
      const goalId = await firebaseAcademicService.addGoal({
        studentId: currentUser.uid,
        subject: 'Test Physics',
        target: 90,
        deadline: '2024-12-31',
        current: 75
      });
      
      // Test getting goals
      const goals = await firebaseAcademicService.getStudentGoals(currentUser.uid);
      
      // Test updating goal
      await firebaseAcademicService.updateGoal(goalId, {
        current: 80
      });
      
      return { status: 'success', message: `Goals management working (${goals.length} goals)` };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const testStudySessions = async () => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test adding study session
      const sessionId = await firebaseAcademicService.addStudySession({
        studentId: currentUser.uid,
        subject: 'Test Chemistry',
        duration: 120,
        topics: 'Organic Chemistry',
        progress: 60,
        date: new Date().toISOString().split('T')[0]
      });
      
      // Test getting study sessions
      const sessions = await firebaseAcademicService.getStudentStudySessions(currentUser.uid);
      
      return { status: 'success', message: `Study sessions working (${sessions.length} sessions)` };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const testPerformanceStats = async () => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test performance stats calculation
      const stats = await firebaseAcademicService.getPerformanceStats(currentUser.uid);
      
      return { 
        status: 'success', 
        message: `Performance stats working (GPA: ${stats.currentGpa}, Subjects: ${stats.totalSubjects})` 
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const TestResult = ({ test, result }) => {
    const getIcon = () => {
      if (result?.status === 'success') return <CheckCircle size={20} color="#10b981" />;
      if (result?.status === 'error') return <XCircle size={20} color="#ef4444" />;
      return <AlertCircle size={20} color="#f59e0b" />;
    };

    const getColor = () => {
      if (result?.status === 'success') return '#10b981';
      if (result?.status === 'error') return '#ef4444';
      return '#f59e0b';
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: result ? `${getColor()}10` : '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '8px'
      }}>
        {getIcon()}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: getColor() }}>
            {test}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {result?.message || 'Not tested yet'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          marginBottom: '8px',
          color: '#1a1a1a'
        }}>
          Firebase Integration Test
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px'
        }}>
          Test all Firebase services and functionality
        </p>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            padding: '12px',
            background: currentUser ? '#10b98110' : '#f59e0b10',
            borderRadius: '8px',
            borderLeft: `4px solid ${currentUser ? '#10b981' : '#f59e0b'}`
          }}>
            <div style={{ fontWeight: '600', color: currentUser ? '#10b981' : '#f59e0b' }}>
              Authentication Status: {currentUser ? 'Authenticated' : 'Not Authenticated'}
            </div>
            {currentUser && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                User: {currentUser.email}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            background: isRunning ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}
        >
          {isRunning ? (
            <>
              <Loader size={16} className="animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run All Tests'
          )}
        </button>

        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#1a1a1a'
          }}>
            Test Results
          </h2>

          <TestResult test="Authentication" result={testResults.auth} />
          <TestResult test="User Profile" result={testResults.userProfile} />
          <TestResult test="Marks Management" result={testResults.marks} />
          <TestResult test="Goals Management" result={testResults.goals} />
          <TestResult test="Study Sessions" result={testResults.studySessions} />
          <TestResult test="Performance Stats" result={testResults.performanceStats} />

          {testResults.error && (
            <div style={{
              padding: '12px',
              background: '#ef444410',
              borderRadius: '8px',
              borderLeft: '4px solid #ef4444',
              marginTop: '16px'
            }}>
              <div style={{ fontWeight: '600', color: '#ef4444' }}>
                Test Suite Error
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {testResults.error}
              </div>
            </div>
          )}
        </div>

        {currentUser && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseTest;
