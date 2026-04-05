import { useState } from "react";
import api from "./api";

function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = async () => {

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await api.post(`/register`, {
        name,
        email,
        password,
        role
      });

      alert(res.data.msg);

      // Go to login page after signup
      window.location.replace("/login");

    } catch (err) {
      console.log(err);
      if (err.response?.data?.errors) {
        alert(err.response.data.errors.map(e => e.msg).join("\n"));
      } else if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        alert("Server error");
      }
    }
  };


  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <h2>Register</h2>

        {/* Name */}
        <input
          placeholder="Name"
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <input
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role */}
        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>


        <button style={styles.btn} onClick={handleSignup}>
          Sign Up
        </button>


        <p>
          Already have account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => window.location.replace("/login")}
          >
            Login
          </span>
        </p>

      </div>

    </div>
  );
}


/* ================= STYLES ================= */

const styles = {

  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
  },

  card: {
    width: "350px",
    background: "#334155",
    padding: "25px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  btn: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#334155",
    border: "none",
    borderRadius: "6px",
    marginTop: "10px",
    cursor: "pointer",
  }

};

export default Signup;
