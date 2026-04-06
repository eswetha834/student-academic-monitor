import React from "react";

function App() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f0f0f0", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#333", textAlign: "center" }}>
        🎉 Test App - Working!
      </h1>
      
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        background: "white", 
        padding: "30px", 
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ color: "#2563eb", marginBottom: "20px" }}>
          Academic Monitoring System
        </h2>
        
        <p style={{ color: "#666", marginBottom: "20px" }}>
          This is a test to see if your app loads correctly.
        </p>
        
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          flexWrap: "wrap",
          marginBottom: "20px"
        }}>
          <button 
            onClick={() => alert('Login button works!')}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Login Test
          </button>
          
          <button 
            onClick={() => alert('Register button works!')}
            style={{
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Register Test
          </button>
        </div>
        
        <div style={{ 
          background: "#fef3c7", 
          padding: "15px", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "#92400e", margin: "0 0 10px 0" }}>
            📊 Status Check
          </h3>
          <p style={{ color: "#78350f", margin: "0", fontSize: "14px" }}>
            If you can see this page, your frontend is working!
          </p>
        </div>
        
        <div style={{ fontSize: "12px", color: "#999" }}>
          <p>Frontend: https://student-academic-monitor.vercel.app</p>
          <p>Backend: https://student-academic-monitor.onrender.com/api</p>
          <p>Time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
