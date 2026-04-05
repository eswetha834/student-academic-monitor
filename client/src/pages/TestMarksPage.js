import React from 'react';
import MarksTest from '../components/MarksTest';

const TestMarksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            🧪 Marks System Verification
          </h1>
          <p className="text-white/60 mb-8">
            Test the marks functionality to ensure it's working properly
          </p>
          
          <MarksTest />
          
          <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl max-w-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">Next Steps:</h2>
            <ol className="text-white/80 space-y-2 list-decimal list-inside">
              <li>1. Test the Marks API above</li>
              <li>2. Check if student data is properly loaded</li>
              <li>3. Verify marks display in Student dashboard</li>
              <li>4. Test search and filtering functionality</li>
              <li>5. Check export functionality</li>
            </ol>
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.location.href = '/student'}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Go to Student Dashboard
              </button>
              
              <button
                onClick={() => window.location.href = '/all-marks'}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Go to All Marks Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMarksPage;
