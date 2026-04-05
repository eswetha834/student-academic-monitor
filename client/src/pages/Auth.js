import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name) || (!isLogin && !confirmPassword)) {
      setError("Please fill all fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    }

    try {
      // LOGIN
      if (isLogin) {
        const res = await axios.post(`${BASE_URL}/api/login`, {
          email,
          password,
        });

        if (res.data && res.data.user) {
          alert(res.data.msg);
          
          // Save user info and token
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userId", res.data.user.id);
          localStorage.setItem("name", res.data.user.name);
          localStorage.setItem("email", res.data.user.email);
          localStorage.setItem("role", res.data.user.role);
          localStorage.setItem("department", res.data.user.department);
          localStorage.setItem("semester", res.data.user.semester);

          // Role based redirect
          if (res.data.user.role === "admin") {
            window.location.replace("/admin");
          } else if (res.data.user.role === "faculty" || res.data.user.role === "teacher") {
            window.location.replace("/faculty");
          } else {
            window.location.replace("/student");
          }
        } else {
          setError(res.data.msg || "Login failed");
        }
      }
      
      // REGISTER
      else {
        const res = await axios.post(`${BASE_URL}/api/register`, {
          name,
          email,
          password,
          role,
        });

        if (res.data && res.data.user) {
          alert("Registration successful! Please login.");
          setIsLogin(true);
          setName(res.data.user.name);
          setEmail(res.data.user.email);
          setRole(res.data.user.role);
        } else {
          setError(res.data.msg || "Registration failed");
        }
      }
    } catch (err) {
      if (err.response) {
        // Handle validation errors (array of errors)
        if (err.response.data.errors) {
          const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data.msg || "Request failed");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
      console.error("Auth error:", err);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        
        {error && (
          <div style={{...styles.alert, backgroundColor: "#f8d7da", color: "#721c24"}}>
            {error}
          </div>
        )}

        {!isLogin && (
          <input
            placeholder="Name"
            style={styles.input}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isLogin && (
          <select
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        )}

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            style={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        <button style={styles.button} onClick={handleSubmit}>
          {isLogin ? "Login" : "Register"}
        </button>

        <p>
          {isLogin ? "No account?" : "Have account?"}
          <span
            style={styles.link}
            onClick={toggleMode}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
  },
  box: {
    width: "350px",
    padding: "25px",
    background: "white",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    marginLeft: "5px",
  },
};

export default Auth;
