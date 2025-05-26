import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthForms.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    role: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const success = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.contactNumber,
        role: formData.role
      });

      if (success) {
        navigate("/dashboard");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}

        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          className="auth-input"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          className="auth-input"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          className="auth-input"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="auth-input"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <input
          name="contactNumber"
          type="tel"
          placeholder="Contact Number"
          className="auth-input"
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          className="auth-input"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="inventory_manager">Inventory Manager</option>
          <option value="developer">Developer</option>
        </select>

        <button type="submit" className="auth-button">Register</button>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
