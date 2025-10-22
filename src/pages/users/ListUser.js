import React, { useState, useEffect } from "react";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./ListUser.css";

export default function ListUser() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [emailError, setEmailError] = useState("");

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    userEmail: "",
    userPhone: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/User");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/Role");
      setRoles(response.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to load roles.");
    }
  };

  const resetForm = () => {
    setNewUser({
      firstName: "",
      lastName: "",
      userEmail: "",
      userPhone: "",
      roleId: "",
      password: "",
      confirmPassword: "",
    });
    setEmailError("");
    setSelectedUserId(null);
    setIsEditMode(false);
  };

  const handleAddUserClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.userID);
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      userEmail: user.userEmail,
      userPhone: user.userPhone,
      roleId: user.role?.roleId || "",
      password: "",
      confirmPassword: "",
    });
    setEmailError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ✅ Email + Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));

    if (name === "userEmail") {
      let error = "";

      if (/[A-Z]/.test(value)) {
        error = "Email must be in lowercase letters only.";
      } else if (value && !value.endsWith("@gmail.com")) {
        error = "Only @gmail.com emails are allowed.";
      } else if (
        value &&
        !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)
      ) {
        error = "Invalid email format.";
      }

      setEmailError(error);
    }
  };

  // ✅ Password strength check
const isStrongPassword = (password) => {
  if (!password) return false;
  const specialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
  return (
    password.length >= 8 &&
    password.length <= 100 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    specialChars.test(password)
  );
};

  // ✅ Add / Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      alert("Please fix the email error before saving.");
      return;
    }

    if (!newUser.firstName || !newUser.userEmail || !newUser.roleId) {
      alert("First name, Email, and Role are required.");
      return;
    }

    try {
      if (isEditMode) {
        // 🔹 UPDATE existing user (PUT)
        const payload = {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userEmail: newUser.userEmail,
          userPhone: newUser.userPhone,
          roleId: parseInt(newUser.roleId),
        };

        // Only update password if provided
        if (newUser.password || newUser.confirmPassword) {
          if (newUser.password !== newUser.confirmPassword) {
            alert("Password and Confirm Password must match.");
            return;
          }
          if (!isStrongPassword(newUser.password)) {
            alert(
              "Password must be 8–100 characters long with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character."
            );
            return;
          }
          payload.password = newUser.password;
          payload.confirmPassword = newUser.confirmPassword;
        }

        const response = await api.put(`/User/${selectedUserId}`, payload);
        alert(response.data.message || "User updated successfully!");
      } else {
        // 🔹 ADD new user (POST)
        if (!newUser.password || !newUser.confirmPassword) {
          alert("Password and Confirm Password are required.");
          return;
        }
        if (newUser.password !== newUser.confirmPassword) {
          alert("Password and Confirm Password must match.");
          return;
        }
        if (!isStrongPassword(newUser.password)) {
          alert(
            "Password must be 8–100 characters long with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character."
          );
          return;
        }

        const payload = {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userEmail: newUser.userEmail,
          userPhone: newUser.userPhone,
          roleId: parseInt(newUser.roleId),
          password: newUser.password,
          confirmPassword: newUser.confirmPassword,
        };

        const response = await api.post("/User", [payload]);
        alert(response.data.message || "User added successfully!");
      }

      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving user:", err);
      if (err.response?.data) alert(err.response.data);
      else alert("Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await api.delete(`/User/${id}`);
        setUsers((prevUsers) => prevUsers.filter((u) => u.userID !== id));
        alert(response.data?.message || "User deleted successfully!");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
      }
    }
  };

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />

      <div className="dashboard-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>User Management</h1>
            <button className="add-user-btn" onClick={handleAddUserClick}>
              Add User
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Contact No</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.userID}>
                      <td>{user.userID}</td>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.userEmail}</td>
                      <td>{user.userPhone}</td>
                      <td>{user.role?.roleName || "N/A"}</td>
                      <td className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(user.userID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🟣 Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditMode ? "Edit User" : "Add New User"}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={newUser.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email (must be @gmail.com):</label>
                <input
                  type="email"
                  name="userEmail"
                  value={newUser.userEmail}
                  onChange={handleChange}
                  required
                  className={emailError ? "input-error" : ""}
                />
                {emailError && (
                  <small className="error-text">{emailError}</small>
                )}
              </div>

              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  name="userPhone"
                  value={newUser.userPhone}
                  onChange={handleChange}
                />
              </div>

              {/* ✅ Password Field */}
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  placeholder={isEditMode ? "Leave blank to keep existing password" : ""}
                  required={!isEditMode}
                  className={
                    newUser.password
                      ? isStrongPassword(newUser.password)
                        ? "input-valid"
                        : "input-error"
                      : ""
                  }
                />
                {newUser.password && !isStrongPassword(newUser.password) && (
                  <small className="error-text">
                    Must include uppercase, lowercase, number, and special char.
                  </small>
                )}
                {newUser.password && isStrongPassword(newUser.password) && (
                  <small className="success-text">Strong password ✅</small>
                )}
              </div>

              {/* ✅ Confirm Password */}
              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={handleChange}
                 placeholder={isEditMode ? "Leave blank to keep existing password" : ""}
                  required={!isEditMode}
                  className={
                    newUser.confirmPassword
                      ? newUser.confirmPassword === newUser.password
                        ? "input-valid"
                        : "input-error"
                      : ""
                  }
                />
                {newUser.confirmPassword &&
                  newUser.confirmPassword !== newUser.password && (
                    <small className="error-text">
                      Passwords do not match ❌
                    </small>
                  )}
              </div>

              <div className="form-group">
                <label>Role:</label>
                <select
                  name="roleId"
                  value={newUser.roleId}
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
              </div>

              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  {isEditMode ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
