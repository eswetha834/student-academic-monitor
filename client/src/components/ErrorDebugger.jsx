import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, X, Bug, Zap, Settings } from 'lucide-react';

const ErrorDebugger = () => {
  const [errors, setErrors] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Generate solution based on error
  const generateSolution = (error, errorType) => {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('401')) {
      return {
        errorId: error.id,
        title: 'Authentication Error',
        description: 'Your login session has expired',
        steps: [
          '1. Clear browser cache and cookies',
          '2. Login again with your credentials',
          '3. Try incognito mode',
          '4. Check if backend is running'
        ],
        code: `// Clear cache
localStorage.clear();
sessionStorage.clear();

// Relogin
window.location.href = '/login';`
      };
    }

    if (errorMessage.includes('500')) {
      return {
        errorId: error.id,
        title: 'Server Error',
        description: 'Internal server error occurred',
        steps: [
          '1. Check if backend is running',
          '2. Wait a moment and try again',
          '3. Check browser console for details',
          '4. Contact support if issue persists'
        ],
        code: `// Check backend status
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend status:', data));`
      };
    }

    if (errorMessage.includes('overrideMethod')) {
      return {
        errorId: error.id,
        title: 'Browser Extension Conflict',
        description: 'Chrome extension is interfering with the application',
        steps: [
          '1. Try incognito mode',
          '2. Disable browser extensions temporarily',
          '3. Use a different browser',
          '4. Clear browser cache'
        ],
        code: `// Ignore extension errors
// These warnings don't affect functionality
console.warn('Ignoring Chrome extension overrideMethod errors');`
      };
    }

    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return {
        errorId: error.id,
        title: 'Network Connection Error',
        description: 'Cannot connect to the server',
        steps: [
          '1. Check internet connection',
          '2. Verify backend is running on port 5000',
          '3. Check firewall settings',
          '4. Try refreshing the page'
        ],
        code: `// Check network
// Test connection
fetch('http://localhost:5000/api/health')
  .catch(err => console.error('Network test failed:', err));`
      };
    }

    return {
      errorId: error.id,
      title: 'General Error',
      description: 'An unexpected error occurred',
      steps: [
        '1. Refresh the page',
        '2. Check browser console for details',
        '3. Clear browser cache',
        '4. Contact support'
      ],
      code: `// General debug
console.error('Error details:', error);
console.trace('Error trace:', error);`
    };
  };

  useEffect(() => {
    if (!isMonitoring) return;

    // Store original console methods
    const originalError = console.error;
    const originalLog = console.log;
    const originalWarn = console.warn;

    const handleError = (error, errorType = 'general') => {
      const timestamp = new Date().toLocaleTimeString();
      const newError = {
        id: Date.now(),
        timestamp,
        type: errorType,
        message: error.message || error.toString(),
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      setErrors(prev => [newError, ...prev.slice(0, 9)]);
      
      // Auto-generate solution
      const solution = generateSolution(newError, errorType);
      setSolutions(prev => [solution, ...prev.slice(0, 9)]);
    };

    // Override console methods to capture errors
    console.error = (...args) => {
      handleError(args[0], 'error');
      originalError(...args);
    };

    console.warn = (...args) => {
      // Optionally capture warnings too
      if (args[0]?.message || typeof args[0] === 'string') {
        handleError({ message: args[0] }, 'warning');
      }
      originalWarn(...args);
    };

    // Monitor for specific errors on the page
    const checkForErrors = () => {
      const commonErrors = ['401', '500', 'overrideMethod', 'Network', 'ECONNREFUSED', 'fetch'];
      
      commonErrors.forEach(errorType => {
        if (document.body.innerText.includes(errorType)) {
          handleError({ message: errorType }, errorType);
        }
      });
    };

    // Set up error monitoring interval
    const interval = setInterval(checkForErrors, 1000);

    // Set up global error handler
    const globalErrorHandler = (event) => {
      handleError(event.error || event.message, 'uncaught');
    };
    window.addEventListener('error', globalErrorHandler);

    // Set up unhandled promise rejection handler
    const promiseRejectionHandler = (event) => {
      handleError(event.reason, 'unhandledrejection');
    };
    window.addEventListener('unhandledrejection', promiseRejectionHandler);

    // Cleanup function
    return () => {
      // Restore original console methods
      console.error = originalError;
      console.log = originalLog;
      console.warn = originalWarn;
      
      // Clear intervals and remove event listeners
      clearInterval(interval);
      window.removeEventListener('error', globalErrorHandler);
      window.removeEventListener('unhandledrejection', promiseRejectionHandler);
    };
  }, [isMonitoring]); // Re-run when monitoring state changes

  const clearErrors = () => {
    setErrors([]);
    setSolutions([]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={20} color="#ef4444" />
          Error Debugger
        </h3>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          style={{
            padding: '4px 8px',
            background: isMonitoring ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {isMonitoring ? 'Stop' : 'Start'} Monitoring
        </button>
        <button
          onClick={clearErrors}
          style={{
            padding: '4px 8px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 15px' }}>
        {errors.length === 0 && solutions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            <AlertTriangle size={24} style={{ marginBottom: '10px' }} />
            <div>No errors detected</div>
            <div style={{ fontSize: '11px', marginTop: '5px' }}>
              Click "Start Monitoring" to begin capturing errors
            </div>
          </div>
        ) : (
          <>
            {errors.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>
                  Recent Errors ({errors.length})
                </h4>
                {errors.map((error, index) => (
                  <div key={error.id} style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px' }}>
                            {error.type.toUpperCase()}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px', wordBreak: 'break-word' }}>
                            {error.message.substring(0, 100)}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                            {error.timestamp}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setErrors(prev => prev.filter(e => e.id !== error.id));
                          setSolutions(prev => prev.filter(s => s.errorId !== error.id));
                        }}
                        style={{
                          padding: '2px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {solutions.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#10b981' }}>
                  Suggested Solutions ({solutions.length})
                </h4>
                {solutions.map((solution) => (
                  <div key={solution.errorId} style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '15px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                      {solution.title}
                    </div>
                    <div style={{ color: '#374151', fontSize: '12px', marginBottom: '8px' }}>
                      {solution.description}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Troubleshooting Steps:</strong>
                    </div>
                    <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '11px' }}>
                      {solution.steps.map((step, stepIndex) => (
                        <li key={stepIndex} style={{ marginBottom: '4px' }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div style={{ marginTop: '10px' }}>
                      <strong>Code Snippet:</strong>
                    </div>
                    <pre style={{
                      background: '#1e293b',
                      color: '#fbbf24',
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {solution.code}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(solution.code);
                        alert('Code copied to clipboard!');
                      }}
                      style={{
                        marginTop: '10px',
                        padding: '6px 12px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      Copy Code
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{
        padding: '10px 15px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '11px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
          <Settings size={14} />
          <span>Real-time Error Monitoring</span>
        </div>
        <div style={{ fontSize: '10px' }}>
          Status: {isMonitoring ? '🟢 Active' : '⚫ Inactive'} • {errors.length} errors captured
        </div>
      </div>
    </div>
  );
};

export default ErrorDebugger;