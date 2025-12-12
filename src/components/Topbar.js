import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

export default function Topbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true); // Show confirmation modal
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowModal(false); // Close modal without logging out
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>Retail Management System</h1>
      </div>
      <button className="logout-button" onClick={handleLogoutClick}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>

      {/* Modal */}
   {showModal && (
  <div className="dialog-backdrop">
    <div className="dialog-panel">
      <div className="dialog-header">
        <h3 className="dialog-title">Confirm Logout</h3>
        <p className="dialog-message">Do you want to logout?</p>
      </div>
      <div className="dialog-actions">
        <button className="topaction-btn topaction-primary" onClick={confirmLogout}>
          Yes
        </button>
        <button className="topaction-btn topaction-secondary" onClick={cancelLogout}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
