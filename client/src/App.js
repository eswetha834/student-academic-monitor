import { BrowserRouter, Routes, Route } from "react-router-dom";

// Test importing original components one by one
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <div style={{padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif'}}>
            <h1 style={{color: '#2563eb', marginBottom: '20px'}}>
              Login / Register
            </h1>
            <div style={{background: '#f8fafc', padding: '30px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto'}}>
              <input 
                type="email" 
                placeholder="Email" 
                style={{width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
              <input 
                type="password" 
                placeholder="Password" 
                style={{width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
              <button 
                style={{
                  width: '100%',
                  background: '#2563eb',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                Login
              </button>
              <button 
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Register
              </button>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: '20px',
                background: '#6b7280',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
