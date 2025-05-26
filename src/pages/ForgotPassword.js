import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AuthForms.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Reset link sent to ${email}`);
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Send Reset Link</button>
        <div className="auth-links">
          <Link to="/">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
