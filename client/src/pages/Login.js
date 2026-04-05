
import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Lock, User, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import "../Auth.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [role, setRole] = useState("student");
  const [loginRole, setLoginRole] = useState("student");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const apiBase = "http://localhost:5000/api";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Enhanced input validation and cleaning
    const cleanedEmail = formData.email.trim().toLowerCase();
    const cleanedPassword = formData.password.trim();
    
    if (!cleanedEmail || !cleanedPassword) {
      return showMessage("Please fill all fields");
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      return showMessage("Please enter a valid email address");
    }
    
    // Password length validation
    if (cleanedPassword.length < 6) {
      return showMessage("Password must be at least 6 characters");
    }

    console.log("🔑 Login attempt:");
    console.log("- Original email:", `"${formData.email}"`);
    console.log("- Cleaned email:", `"${cleanedEmail}"`);
    console.log("- Password length:", cleanedPassword.length);
    console.log("- Role:", loginRole);
    console.log("- API URL:", `${apiBase}/login`);

    setLoading(true);
    try {
      const payload = {
        email: cleanedEmail,
        password: cleanedPassword,
        role: loginRole === "faculty" ? "teacher" : loginRole
      };
      
      console.log("📤 Frontend sending payload:", payload);
      
      const res = await axios.post(`${apiBase}/login`, payload);

      console.log("✅ Login response:", res.data);
      console.log("- Token exists:", !!res.data.token);
      console.log("- User role:", res.data.user.role);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("department", res.data.user.department);
      localStorage.setItem("semester", res.data.user.semester);
      localStorage.setItem("rollNumber", res.data.user.rollNumber);
      localStorage.setItem("profilePic", res.data.user.profilePic);

      if (res.data.user.role === "student") window.location.href = "/student";
      else if (res.data.user.role === "teacher") window.location.href = "/faculty";
      else window.location.href = "/admin";

    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("- Error response:", err.response?.data);
      console.error("- Error status:", err.response?.status);
      console.error("- Error message:", err.response?.data?.msg);
      showMessage(err.response?.data?.msg || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanedEmail = formData.email.trim().toLowerCase();
    const cleanedName = formData.name.trim();
    const cleanedPassword = formData.password.trim();
    const cleanedConfirm = formData.confirmPassword.trim();

    if (!cleanedName || !cleanedEmail || !cleanedPassword || !cleanedConfirm) {
      return showMessage("Please fill all fields");
    }

    if (cleanedPassword.length < 6) {
      return showMessage("Password must be at least 6 characters");
    }

    if (cleanedPassword !== cleanedConfirm) {
      return showMessage("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/register`, {
        name: cleanedName,
        email: cleanedEmail,
        password: cleanedPassword,
        role: role === "faculty" ? "teacher" : role
      });

      showMessage("Registration successful! Switching to login...", "success");
      setTimeout(() => setIsLogin(true), 1000);
    } catch (err) {
      const serverMsg = err.response?.data?.msg;
      const serverErrors = err.response?.data?.errors;
      const combinedError = serverErrors ? serverErrors.map((e) => e.msg).join(", ") : null;
      showMessage(serverMsg || combinedError || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) return showMessage("Enter email first");

    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/forgot-password`, { email: formData.email });
      showMessage(res.data.msg, "success");
      // Simulated link logic below for local testing convenience but could be real email link
      if (res.data.token) console.log("Reset Token:", res.data.token);
    } catch (err) {
      showMessage(err.response?.data?.msg || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  const googleMock = () => {
    alert("Google Sign-In initialized. (Mock Interface)");
  };

  // If already authenticated, redirect to their dashboard immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) return;
    if (role === "student") window.location.href = "/student";
    else if (role === "faculty") window.location.href = "/faculty";
    else if (role === "admin") window.location.href = "/admin";
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>{isForgot ? "Enter your email to receive recovery instructions." : isLogin ? "Manage your academic progress with AI insights." : "Join thousands of students and faculty today."}</p>
        </div>

        {message.text && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "10px",
            background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: message.type === "success" ? "#10b981" : "#ef4444",
            fontSize: "13px", marginBottom: "20px", border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
          }}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {!isForgot && (
          <div className="auth-tabs">
            <div className={`auth-tab ${isLogin ? "active" : ""}`} onClick={() => { setIsLogin(true); setMessage({ text: "", type: "" }); }}>Login</div>
            <div className={`auth-tab ${!isLogin ? "active" : ""}`} onClick={() => { setIsLogin(false); setMessage({ text: "", type: "" }); }}>Register</div>
          </div>
        )}

        <form onSubmit={isForgot ? handleForgotPassword : isLogin ? handleLogin : handleRegister}>
          {isLogin && !isForgot && (
            <div className="role-selector">
              <div className={`role-option ${loginRole === "student" ? "active" : ""}`} onClick={() => setLoginRole("student")}>Student</div>
              <div className={`role-option ${loginRole === "faculty" ? "active" : ""}`} onClick={() => setLoginRole("faculty")}>Faculty</div>
              <div className={`role-option ${loginRole === "admin" ? "active" : ""}`} onClick={() => setLoginRole("admin")}>Admin</div>
            </div>
          )}
          
          {!isLogin && !isForgot && (
            <>
              <div className="role-selector">
                <div className={`role-option ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>Student</div>
                <div className={`role-option ${role === "faculty" ? "active" : ""}`} onClick={() => setRole("faculty")}>Faculty</div>
                <div className={`role-option ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>Admin</div>
              </div>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input name="name" placeholder="Full Name" className="auth-input" value={formData.name} onChange={handleInputChange} />
              </div>
            </>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              name="email" 
              type="email" 
              placeholder="Email Address" 
              className="auth-input" 
              value={formData.email} 
              onChange={handleInputChange}
              onBlur={(e) => {
                // Auto-trim on blur to remove spaces
                setFormData({ ...formData, email: e.target.value.trim() });
              }}
              style={{ textTransform: 'lowercase' }}
            />
          </div>

          {!isForgot && (
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                className="auth-input" 
                value={formData.password} 
                onChange={handleInputChange}
                onBlur={(e) => {
                  // Auto-trim on blur to remove spaces
                  setFormData({ ...formData, password: e.target.value.trim() });
                }}
              />
            </div>
          )}

          {!isLogin && !isForgot && (
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" className="auth-input" value={formData.confirmPassword} onChange={handleInputChange} />
            </div>
          )}

          {isLogin && !isForgot && (
            <span className="forgot-password" onClick={() => setIsForgot(true)}>Forgot password?</span>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Processing..." : isForgot ? "Send Link" : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {isForgot && (
          <div className="auth-footer" style={{ marginTop: "20px" }}>
            Remembered? <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }} onClick={() => setIsForgot(false)}>Back to login</span>
          </div>
        )}

        {!isForgot && (
          <>
            <div style={{ display: "flex", alignItems: "center", margin: "25px 0", color: "#64748b" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
              <span style={{ padding: "0 10px", fontSize: "12px" }}>Social Connect</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
            </div>

            <button className="google-btn" onClick={googleMock}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already a member?"} <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Register Now" : "Sign In"}</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "40px", color: "#64748b", fontSize: "12px", textAlign: "center", width: "100%", zIndex: 5 }}>
        &copy; 2026 Academic Monitor Systems. All Rights Reserved.
      </div>
    </div>
  );
}
