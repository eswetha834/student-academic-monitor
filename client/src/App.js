import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import components one by one to find the issue
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div style={{padding: '20px', textAlign: 'center'}}>
          <h1>🎉 Academic Monitoring System</h1>
          <p>App is loading successfully!</p>
          <a href="/login">Go to Login</a>
        </div>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
