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
const [errors, setErrors] = useState({});

  // Fetch roles from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/Role");
        setRoles(response.data);
      } catch (err) {
        console.error("Error fetching roles:", err);
         setErrors((prevErrors) => [
        ...prevErrors,
         "Failed to load roles. Please try again later.",
      ]);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  // Clear the specific error as user corrects it
  setErrors((prevErrors) => {
    const updatedErrors = { ...prevErrors };
    delete updatedErrors[name];

    // Special case: clear general error if user is typing
    if (updatedErrors.general) {
      delete updatedErrors.general;
    }

    return updatedErrors;
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
     const validationErrors = {};
const email = formData.email.trim();
if (!formData.firstName.trim()) {
  validationErrors.firstName = "Enter First Name";
}

if (!formData.lastName.trim()) {
  validationErrors.lastName = "Enter Last Name";
}

if (!formData.contactNumber.trim()) {
  validationErrors.contactNumber = "Enter Contact Number";
}

if (/[A-Z]/.test(email)) {
  validationErrors.email = "Email must be in lowercase letters only.";
} else if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(email)) {
  validationErrors.email = "Only valid @gmail.com addresses are allowed.";
}

if (formData.password !== formData.confirmPassword) {
  validationErrors.confirmPassword = "Passwords do not match.";
}

if (
  !/[A-Z]/.test(formData.password) ||
  !/[a-z]/.test(formData.password) ||
  !/[0-9]/.test(formData.password) ||
  !/[!@#$%^&*]/.test(formData.password) ||
  formData.password.length < 8
) {
  validationErrors.password =
    "Password must be 8+ chars, with uppercase, lowercase, digit, and special character.";
}


if (!formData.role) {
  validationErrors.role = "Please select a role.";
}

if (Object.keys(validationErrors).length > 0) {
  setErrors(validationErrors);
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
      setErrors(["Registration failed. Please try again."]);
    }
  } catch (err) {
    const backendError = err.response?.data?.message || err.message;
   const backendErrors = {};
if (backendError.includes("already exists")) {
  backendErrors.email = "Email already exists.";
} else if (backendError.includes("lowercase")) {
  backendErrors.email = "Email must be in lowercase letters only.";
} else if (backendError.includes("Invalid email")) {
  backendErrors.email = "Invalid email address format.";
} else {
  backendErrors.general = backendError || "An error occurred during registration.";
}
setErrors(backendErrors);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <h2>Register</h2>
       {errors.length > 0 && (
  <div className="error-message">
    <ul>
     {errors.general && (
  <div className="error-message">
    <p>{errors.general}</p>
  </div>
)}
    </ul>
  </div>
)}
        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          className="auth-input"
          value={formData.firstName}
          onChange={handleChange}
          required
        />{errors.firstName && <span className="error-text">{errors.firstName}</span>}

        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          className="auth-input"
          value={formData.lastName}
          onChange={handleChange}
          required
        />{errors.lastName && <span className="error-text">{errors.lastName}</span>}

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          className="auth-input"
          value={formData.email}
          onChange={handleChange}
          required
        />{errors.email && <span className="error-text">{errors.email}</span>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="auth-input"
          value={formData.password}
          onChange={handleChange}
          required
        />{errors.password && <span className="error-text">{errors.password}</span>}

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />{errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

        <input
          name="contactNumber"
          type="tel"
          placeholder="Contact Number"
          className="auth-input"
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />{errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}

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
{errors.role && <span className="error-text">{errors.role}</span>}

        <button type="submit" className="auth-button">Register</button>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}     
