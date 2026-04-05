import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react';

const MarksTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const studentId = localStorage.getItem("userId");

  const testMarksAPI = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing marks API for student:', studentId);
      
      // Test the marks endpoint
      const response = await api.get(`/student-marks/${studentId}`);
      
      console.log('📊 API Response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response status:', response.status);
      
      if (response.data && Array.isArray(response.data)) {
        const marks = response.data;
        
        setTestResult({
          success: true,
          message: `✅ Successfully fetched ${marks.length} marks`,
          details: {
            total: marks.length,
            subjects: [...new Set(marks.map(m => m.subject))],
            hasData: marks.length > 0,
            sample: marks.slice(0, 3)
          }
        });
        
        console.log('✅ Marks API test passed!');
      } else {
        setTestResult({
          success: false,
          message: '❌ Invalid response format from API',
          details: response
        });
      }
      
    } catch (error) {
      console.error('❌ API Test Error:', error);
      setTestResult({
        success: false,
        message: `❌ API Error: ${error.message}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testLocalStorage = () => {
    const studentId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    console.log('🔍 Checking localStorage:', {
      studentId,
      hasToken: !!token,
      role,
      keys: Object.keys(localStorage)
    });
    
    setTestResult({
      success: !!studentId && !!token && role === 'student',
      message: `✅ Student logged in: ID=${studentId}, Role=${role}`,
      details: { studentId, token: !!token, role }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            🧪 Marks System Test
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* API Test */}
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Test Marks API
              </h2>
              
              <button
                onClick={testMarksAPI}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Marks API'}
              </button>
            </div>

            {/* Local Storage Test */}
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                Check Local Storage
              </h2>
              
              <button
                onClick={testLocalStorage}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Check Login Status
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`mt-8 p-6 rounded-xl ${
              testResult.success ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {testResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                )}
                <h3 className="text-xl font-semibold text-white">
                  {testResult.success ? '✅ Test Passed' : '❌ Test Failed'}
                </h3>
              </div>
              
              <div className="text-white">
                <p className="font-medium mb-2">{testResult.message}</p>
                
                {testResult.details && (
                  <div className="mt-4 p-4 bg-black/20 rounded-lg">
                    <h4 className="font-medium mb-2">Details:</h4>
                    <pre className="text-sm text-white/80 overflow-x-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarksTest;
