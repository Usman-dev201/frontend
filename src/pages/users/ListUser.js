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
      console.error(err);
      setError("Failed to load users.");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/Role");
      setRoles(response.data);
    } catch (err) {
      console.error(err);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));

    if (name === "userEmail") {
      let error = "";
      if (/[A-Z]/.test(value)) error = "Email must be lowercase.";
      else if (value && !value.endsWith("@gmail.com"))
        error = "Only @gmail.com emails allowed.";
      else if (value && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value))
        error = "Invalid email format.";

      setEmailError(error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      alert("Please fix the email error.");
      return;
    }

    if (!newUser.firstName || !newUser.userEmail || !newUser.roleId) {
      alert("First name, Email, and Role are required.");
      return;
    }

    try {
      if (isEditMode) {
        const payload = {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userEmail: newUser.userEmail,
          userPhone: newUser.userPhone,
          roleId: parseInt(newUser.roleId),
        };

        if (newUser.password || newUser.confirmPassword) {
          if (newUser.password !== newUser.confirmPassword) {
            alert("Passwords must match.");
            return;
          }
          if (!isStrongPassword(newUser.password)) {
            alert(
              "Password must include uppercase, lowercase, number, and special char."
            );
            return;
          }
          payload.password = newUser.password;
          payload.confirmPassword = newUser.confirmPassword;
        }

        const response = await api.put(`/User/${selectedUserId}`, payload);
        alert(response.data.message || "User updated successfully!");
      } else {
        if (!newUser.password || !newUser.confirmPassword) {
          alert("Password and Confirm Password are required.");
          return;
        }
        if (newUser.password !== newUser.confirmPassword) {
          alert("Passwords must match.");
          return;
        }
        if (!isStrongPassword(newUser.password)) {
          alert(
            "Password must include uppercase, lowercase, number, and special char."
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

        await api.post("/User", [payload]);
        alert("User added successfully!");
      }

      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/User/${id}`);
      setUsers((prev) => prev.filter((u) => u.userID !== id));
      alert("User deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="user-page">
      <Topbar />
      <Sidebar />

      <div className="user-container">
        <div className="user-header">
          <h2>Users List</h2>
          <button className="btn btn-primary" onClick={handleAddUserClick}>
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
                <th>Contact</th>
                <th>Role</th>
                <th>Actions</th>
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
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{isEditMode ? "Edit User" : "Add User"}</h3>
            <div className="modal-content">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={newUser.firstName}
                onChange={handleChange}
              />

              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={newUser.lastName}
                onChange={handleChange}
              />

              <label>Email (@gmail.com only):</label>
              <input
                type="email"
                name="userEmail"
                value={newUser.userEmail}
                onChange={handleChange}
                className={emailError ? "input-error" : ""}
              />
              {emailError && <small className="error-text">{emailError}</small>}

              <label>Phone:</label>
              <input
                type="text"
                name="userPhone"
                value={newUser.userPhone}
                onChange={handleChange}
              />

              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleChange}
                placeholder={isEditMode ? "Leave blank to keep existing password" : ""}
              />

              <label>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={newUser.confirmPassword}
                onChange={handleChange}
                placeholder={isEditMode ? "Leave blank to keep existing password" : ""}
              />

              <label>Role:</label>
              <select
                name="roleId"
                value={newUser.roleId}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {isEditMode ? "Update" : "Save"}
                </button>
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
