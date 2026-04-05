import { useState } from "react";
import api from "../api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) return alert("Please enter your email");
        setLoading(true);
        try {
            const res = await api.post("/forgot-password", { email });
            alert(res.data.msg);
            window.location.href = "/login";
        } catch (err) {
            if (err.response?.data?.msg) {
                alert(err.response.data.msg);
            } else {
                alert("Server error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>🔐</div>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>Enter your registered email address</p>

                <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px', color: '#475569', fontSize: '14px', fontWeight: 'bold' }}>Email Address</label>
                <input
                    type="email"
                    placeholder="your.email@example.com"
                    style={styles.input}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <button style={styles.btn} onClick={handleReset} disabled={loading}>
                    {loading ? "Processing..." : "Send Reset Link"}
                </button>

                <p style={{ marginTop: "15px", fontSize: "14px", color: "#64748b" }}>
                    Remember your password?{" "}
                    <span style={{ color: "#2563eb", cursor: "pointer", fontWeight: "bold" }} onClick={() => window.location.href = "/login"}>Login</span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc" },
    card: { width: "380px", background: "white", padding: "40px", borderRadius: "24px", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" },
    icon: { fontSize: "48px", marginBottom: "20px" },
    title: { marginBottom: "10px", color: "#1e293b", fontSize: "24px", fontWeight: "900" },
    subtitle: { color: "#64748b", marginBottom: "30px", fontSize: "14px", fontWeight: "600" },
    input: { width: "100%", padding: "14px", border: "1.5px solid #e2e8f0", borderRadius: "12px", boxSizing: "border-box", marginBottom: "20px", outline: "none", fontSize: "16px" },
    btn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "16px", transition: "all 0.3s" }
};

export default ForgotPassword;
