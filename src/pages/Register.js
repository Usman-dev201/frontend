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

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch roles from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/Role");
        setRoles(response.data);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: "Failed to load roles. Please try again later."
        }));
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Remove field-specific error as user types
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      delete updatedErrors.general; // remove general errors while typing
      return updatedErrors;
    });

    // Also clear confirmPassword error if either password field changes
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const validationErrors = {};
    const email = formData.email.trim();

    if (!formData.firstName.trim()) validationErrors.firstName = "Enter First Name";
    if (!formData.lastName.trim()) validationErrors.lastName = "Enter Last Name";

    if (!formData.contactNumber.trim()) validationErrors.contactNumber = "Enter Contact Number";
    else if (!/^\d{10,15}$/.test(formData.contactNumber))
      validationErrors.contactNumber = "Enter a valid contact number";

    if (/[A-Z]/.test(email)) validationErrors.email = "Email must be lowercase";
    else if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(email))
      validationErrors.email = "Only valid @gmail.com addresses are allowed";

    if (formData.password !== formData.confirmPassword)
      validationErrors.confirmPassword = "Passwords do not match";

    if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password) ||
      !/[!@#$%^&*]/.test(formData.password) ||
      formData.password.length < 8
    )
      validationErrors.password =
        "Password must be 8+ chars, with uppercase, lowercase, digit, and special character";

    if (!formData.role) validationErrors.role = "Please select a role";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare payload
    const selectedRole = roles.find((r) => r.roleId === parseInt(formData.role, 10));
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      userEmail: email.toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      userPhone: formData.contactNumber,
      roleId: selectedRole?.roleId,
      role: { roleName: selectedRole?.roleName }
    };

try {
  const result = await authRegister(payload);

  if (result.success) {
    navigate("/login");
  } else {
    // Display backend error under the correct field or general
    const backendErrors = {};
    const msg = result.message;

    if (msg.includes("already exists")) backendErrors.email = msg;
    else if (msg.includes("lowercase")) backendErrors.email = msg;
    else if (msg.includes("Invalid email")) backendErrors.email = msg;
    else if (msg.includes("Password")) backendErrors.password = msg;
    else backendErrors.general = msg;

    setErrors(backendErrors);
  }
} catch (err) {
  setErrors({ general: "An unexpected error occurred. Please try again." });
}

  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <h2>Register</h2>

        {/* General backend errors */}
        {errors.general && <div className="error-message">{errors.general}</div>}

        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          className="auth-input"
          value={formData.firstName}
          onChange={handleChange}
        />
        {errors.firstName && <span className="error-text">{errors.firstName}</span>}

        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          className="auth-input"
          value={formData.lastName}
          onChange={handleChange}
        />
        {errors.lastName && <span className="error-text">{errors.lastName}</span>}

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          className="auth-input"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="auth-input"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

        <input
          name="contactNumber"
          type="tel"
          placeholder="Contact Number"
          className="auth-input"
          value={formData.contactNumber}
          onChange={handleChange}
        />
        {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}

        <select
          name="role"
          className="auth-input"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
        </select>
        {errors.role && <span className="error-text">{errors.role}</span>}

        <button type="submit" className="auth-button">
          Register
        </button>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
