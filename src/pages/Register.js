import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthForms.css";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    role: ""
  });

  const [roles, setRoles] = useState([]); // For storing roles from API
  const [error, setError] = useState("");

  // Fetch roles from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("https://localhost:7020/api/Role");
        setRoles(response.data);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to load roles. Please try again later.");
      }
    };

    fetchRoles();
  }, []);

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

    const selectedRole = roles.find(r => r.roleId === parseInt(formData.role, 10));

const payload = {
  firstName: formData.firstName,
  lastName: formData.lastName,
  userEmail: formData.email.toLowerCase().trim(),
  password: formData.password,
  confirmPassword: formData.confirmPassword,
  userPhone: formData.contactNumber,
  roleId: selectedRole?.roleId,
  role: {
    roleName: selectedRole?.roleName
  }
};

    try {
      const success = await authRegister(payload);
      if (success) {
        navigate("/Login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during registration.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
          {roles.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
        </select>

        <button type="submit" className="auth-button">Register</button>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}     
