
import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Lock, User, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
// import "../Auth.css"; // CSS removed to avoid build issues

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [role, setRole] = useState("student");
  const [loginRole, setLoginRole] = useState("student");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const apiBase = "https://student-academic-monitor.onrender.com/api";

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
          <h1 style={{ color: "#ffffff", fontWeight: "900" }}>{isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p style={{ color: "#334155" }}>{isForgot ? "Enter your email to receive recovery instructions." : isLogin ? "Manage your academic progress with AI insights." : "Join thousands of students and faculty today."}</p>
        </div>

        {message.text && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "10px",
            background: message.type === "success" ? "rgba(249, 252, 251, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: message.type === "success" ? "#10b981" : "#ef4444",
            fontSize: "13px", marginBottom: "20px", border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
          }}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {!isForgot && (
          <div className="auth-tabs">
            <div className={`auth-tab ${isLogin ? "active" : ""}`} onClick={() => { setIsLogin(true); setMessage({ text: "", type: "" }); }}><span>Login</span></div>
            <div className={`auth-tab ${!isLogin ? "active" : ""}`} onClick={() => { setIsLogin(false); setMessage({ text: "", type: "" }); }}><span>Register</span></div>
          </div>
        )}

        <form onSubmit={isForgot ? handleForgotPassword : isLogin ? handleLogin : handleRegister}>
          {isLogin && !isForgot && (
            <div className="role-selector">
              <div className={`role-option ${loginRole === "student" ? "active" : ""}`} onClick={() => setLoginRole("student")}><span>Student</span></div>
              <div className={`role-option ${loginRole === "faculty" ? "active" : ""}`} onClick={() => setLoginRole("faculty")}><span>Faculty</span></div>
              <div className={`role-option ${loginRole === "admin" ? "active" : ""}`} onClick={() => setLoginRole("admin")}><span>Admin</span></div>
            </div>
          )}
          
          {!isLogin && !isForgot && (
            <>
              <div className="role-selector">
                <div className={`role-option ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}><span>Student</span></div>
                <div className={`role-option ${role === "faculty" ? "active" : ""}`} onClick={() => setRole("faculty")}><span>Faculty</span></div>
                <div className={`role-option ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}><span>Admin</span></div>
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

        <div className="auth-footer">
          {isLogin ? "Don't have an account? " : "Already a member? "} <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Register Now" : "Sign In"}</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "40px", color: "#64748b", fontSize: "12px", textAlign: "center", width: "100%", zIndex: 5 }}>
        &copy; 2026 Academic Monitor Systems. All Rights Reserved.
      </div>
    </div>
  );
}
