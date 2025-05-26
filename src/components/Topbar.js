import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

export default function Topbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>Retail Management System</h1>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
  );
} 