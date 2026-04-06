import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const FirebaseAuth = ({ onAuthSuccess }) => {
  const { login, signup, currentUser, loading, error } = useFirebase();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    department: '',
    semester: '',
    rollNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      onAuthSuccess(currentUser);
    }
  }, [currentUser, onAuthSuccess]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          semester: formData.semester,
          rollNumber: formData.rollNumber
        });
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            {isLogin ? 'Sign in to your account' : 'Join Academic Monitor'}
          </p>
        </div>

        {(formError || error) && (
          <div style={{
            background: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s'
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
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
                    fontSize: '14px'
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
                  Semester
                </label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="e.g., 4th"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
                    fontSize: '14px'
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
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., CS2024001"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333'
            }}>
              <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Email Address
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
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
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
                  transition: 'border-color 0.2s'
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuth;
