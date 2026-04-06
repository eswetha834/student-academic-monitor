import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px", textAlign: "center" }}>
            <h1 style={{ color: "#1e293b", marginBottom: "20px" }}>
                🎉 Academic Monitoring System
            </h1>
            <p style={{ color: "#64748b", marginBottom: "30px" }}>
                Manage your academic journey with AI-powered insights
            </p>
            
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link 
                    to="/login" 
                    style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600"
                    }}
                >
                    Login
                </Link>
                
                <Link 
                    to="/login" 
                    style={{
                        background: "#10b981",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600"
                    }}
                >
                    Register
                </Link>
            </div>
            
            <div style={{ marginTop: "40px", padding: "20px", background: "white", borderRadius: "8px", maxWidth: "600px", margin: "40px auto" }}>
                <h2 style={{ color: "#1e293b", marginBottom: "15px" }}>Features</h2>
                <ul style={{ textAlign: "left", color: "#64748b" }}>
                    <li>Student Dashboard</li>
                    <li>Faculty Dashboard</li>
                    <li>Admin Panel</li>
                    <li>AI Predictions</li>
                    <li>Performance Analytics</li>
                </ul>
            </div>
            
            <div style={{ background: "#fef3c7", padding: "20px", borderRadius: "8px", maxWidth: "600px", margin: "30px auto" }}>
                <h3 style={{ color: "#92400e", marginBottom: "10px" }}>📞 Test Instructions</h3>
                <p style={{ color: "#78350f", textAlign: "left" }}>
                    1. Click "Login" button<br/>
                    2. Try to register a new user<br/>
                    3. If you see errors, check browser console (F12)<br/>
                    4. Tell me what errors you see
                </p>
            </div>
            
            <div style={{ marginTop: "40px", fontSize: "14px", color: "#94a3b8" }}>
                <p>Frontend URL: https://student-academic-monitor.vercel.app</p>
                <p>Backend URL: https://student-academic-monitor.onrender.com/api</p>
            </div>
        </div>
    );
}
