// Firebase Login Component - Test the Complete Flow
import React, { useState } from 'react';
import { authAPI } from '../services/apiService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const FirebaseLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Step 5: Login with Firebase and get token
      // Step 6: Send token to backend
      const response = await authAPI.login(formData.email, formData.password);
      
      setMessage('Login successful! Firebase + Backend flow working!');
      setMessageType('success');
      
      console.log('Complete flow successful:', response);
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || 'Login failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenFlow = async () => {
    setMessage('Testing Firebase token flow...');
    setMessageType('info');
    
    try {
      // This demonstrates the complete flow you described
      const token = localStorage.getItem('firebaseToken');
      
      if (token) {
        console.log('Token from localStorage:', token);
        
        // Step 6: Send token to backend
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessage('Token verification successful! Backend verified Firebase token.');
          setMessageType('success');
          console.log('Backend response:', data);
        } else {
          throw new Error('Token verification failed');
        }
      } else {
        setMessage('No token found. Please login first.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Token flow error:', error);
      setMessage('Token flow failed: ' + error.message);
      setMessageType('error');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#1a1a1a',
        fontWeight: '800'
      }}>
        🔥 Firebase Login Test
      </h2>
      
      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Testing Flow:</strong><br/>
        1. Firebase Login → Get Token<br/>
        2. Send Token → Backend<br/>
        3. Backend Verifies → Access Granted
      </div>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: messageType === 'success' ? '#d4edda' : 
                     messageType === 'error' ? '#f8d7da' : '#d1ecf1',
          color: messageType === 'success' ? '#155724' : 
                 messageType === 'error' ? '#721c24' : '#0c5460'
        }}>
          {messageType === 'success' ? <CheckCircle size={16} /> : 
           messageType === 'error' ? <AlertCircle size={16} /> : 
           <AlertCircle size={16} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }}>
            <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e1e1',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }}>
            <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '40px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: isLoading ? '#9ca3af' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {isLoading ? 'Logging in...' : '🔥 Test Firebase Login'}
        </button>
      </form>

      <button
        onClick={testTokenFlow}
        style={{
          width: '100%',
          padding: '12px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        🧪 Test Token Flow Only
      </button>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#856404'
      }}>
        <strong>⚠️ Setup Required:</strong><br/>
        1. Create Firebase project<br/>
        2. Update firebase.js config<br/>
        3. Add serviceAccountKey.json to server<br/>
        4. Enable Email/Password auth
      </div>
    </div>
  );
};

export default FirebaseLogin;
