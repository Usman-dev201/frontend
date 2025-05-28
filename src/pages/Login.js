import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthForms.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    // Frontend validation
  if (!email.trim() || !password.trim()) {
    setError("Credentials are not valid");
    return;
  }
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } 
      else {
      setError("Invalid email or password");
    }
    }
    
     catch (err) {
      // Check server-sent messages
    const serverMessage = err?.response?.data;

    if (serverMessage === "Credentials are not valid") {
      setError("Credentials are not valid");
    } else if (serverMessage === "User is not valid") {
      setError("User is not valid");
    } else {
      setError("Login failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        /> {error && <span className="error-text">{error}</span>}
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="auth-links">
          <Link to="/register">Register</Link> | 
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}
