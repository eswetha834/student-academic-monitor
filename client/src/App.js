import React, { useState } from "react";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage(`Login attempt: ${email} (Frontend Only - No Backend)`);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage(`Registration attempt: ${email} (Frontend Only - No Backend)`);
    setTimeout(() => setMessage(""), 3000);
  };

  if (showLogin) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: "400px"
        }}>
          <h2 style={{ color: "#333", textAlign: "center", marginBottom: "30px" }}>
            {message.includes("Login") ? "Login" : "Register"}
          </h2>
          
          {message && (
            <div style={{
              background: "#fef3c7",
              color: "#92400e",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              {message}
            </div>
          )}

          <form onSubmit={message.includes("Login") ? handleLogin : handleRegister}>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px"
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#2563eb",
                color: "white",
                padding: "12px",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "10px"
              }}
            >
              {message.includes("Login") ? "Login" : "Register"}
            </button>
          </form>
          
          <button
            onClick={() => setShowLogin(false)}
            style={{
              width: "100%",
              background: "#6b7280",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        background: "white", 
        padding: "40px", 
        borderRadius: "15px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          color: "#2563eb", 
          textAlign: "center", 
          marginBottom: "30px",
          fontSize: "2.5em"
        }}>
          🎉 Academic Monitoring System
        </h1>
        
        <div style={{ 
          textAlign: "center", 
          marginBottom: "40px",
          fontSize: "1.2em",
          color: "#666"
        }}>
          <p>✅ Frontend Only Test - No Backend Connection</p>
          <p>✅ Pure React Application</p>
          <p>✅ Working Successfully!</p>
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "40px"
        }}>
          <button 
            onClick={() => {setShowLogin(true); setMessage("Login Frontend Test");}}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            🔐 Login Test
          </button>
          
          <button 
            onClick={() => {setShowLogin(true); setMessage("Register Frontend Test");}}
            style={{
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            📝 Register Test
          </button>
        </div>
        
        <div style={{ 
          background: "#f8fafc", 
          padding: "25px", 
          borderRadius: "10px",
          marginBottom: "30px"
        }}>
          <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>
            � Frontend Status Check
          </h3>
          <div style={{ color: "#64748b", lineHeight: "1.6" }}>
            <p>✅ React Components Working</p>
            <p>✅ State Management Working</p>
            <p>✅ Form Handling Working</p>
            <p>✅ Navigation Working</p>
            <p>✅ Styling Working</p>
          </div>
        </div>
        
        <div style={{ 
          background: "#dbeafe", 
          padding: "25px", 
          borderRadius: "10px",
          marginBottom: "30px"
        }}>
          <h3 style={{ color: "#1e40af", marginBottom: "15px" }}>
            📱 Deployment Information
          </h3>
          <div style={{ color: "#1e3a8a", fontSize: "14px", lineHeight: "1.6" }}>
            <p><strong>Frontend URL:</strong> https://student-academic-monitor.vercel.app</p>
            <p><strong>Backend URL:</strong> Not Connected (Frontend Only)</p>
            <p><strong>Database:</strong> Not Connected (Frontend Only)</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div style={{ 
          background: "#fef3c7", 
          padding: "25px", 
          borderRadius: "10px"
        }}>
          <h3 style={{ color: "#92400e", marginBottom: "15px" }}>
            🎯 Next Steps
          </h3>
          <div style={{ color: "#78350f", lineHeight: "1.6" }}>
            <p>1. ✅ Frontend is working!</p>
            <p>2. 🔄 Next: Connect to backend</p>
            <p>3. 🔄 Next: Add real authentication</p>
            <p>4. 🔄 Next: Add full features</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
