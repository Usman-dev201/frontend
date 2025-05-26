import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    inventory: false,
    purchase: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <i className="fas fa-store"></i>
          <h2>Retail MS</h2>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="fas fa-tachometer-alt"></i>
          </div>
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('users')}
          >
            <div className="nav-icon">
              <i className="fas fa-users"></i>
            </div>
            <span>Users</span>
            <i className={`fas fa-chevron-${expandedSections.users ? 'down' : 'right'}`}></i>
          </div>
          {expandedSections.users && (
            <div className="sub-items">
              <NavLink to="/users/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <span>List Users</span>
              </NavLink>
              <NavLink to="/users/roles" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-user-shield"></i>
                </div>
                <span>Roles</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('inventory')}
          >
            <div className="nav-icon">
              <i className="fas fa-box"></i>
            </div>
            <span>Inventory</span>
            <i className={`fas fa-chevron-${expandedSections.inventory ? 'down' : 'right'}`}></i>
          </div>
          {expandedSections.inventory && (
            <div className="sub-items">
              <NavLink to="/product/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-list"></i>
                </div>
                <span>List Product</span>
              </NavLink>
              <NavLink to="/product/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-plus"></i>
                </div>
                <span>Add Product</span>
              </NavLink>
              <NavLink to="/categories" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-tags"></i>
                </div>
                <span>Categories</span>
              </NavLink>
              <NavLink to="/brands" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-trademark"></i>
                </div>
                <span>Brands</span>
              </NavLink>
              <NavLink to="/barcode/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-barcode"></i>
                </div>
                <span>Barcode</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('purchase')}
          >
            <div className="nav-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <span>Purchase</span>
            <i className={`fas fa-chevron-${expandedSections.purchase ? 'down' : 'right'}`}></i>
          </div>
          {expandedSections.purchase && (
            <div className="sub-items">
              <NavLink to="/purchase/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-list"></i>
                </div>
                <span>List Purchase</span>
              </NavLink>
              <NavLink to="/purchase/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-plus"></i>
                </div>
                <span>Add Purchase</span>
              </NavLink>
              <NavLink to="/purchase/return" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-undo"></i>
                </div>
                <span>Return Purchase</span>
              </NavLink>
              <NavLink to="/purchase/suppliers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <i className="fas fa-truck"></i>
                </div>
                <span>Suppliers</span>
              </NavLink>
            </div>
          )}
        </div>
        <NavLink to="/stock/transfer" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <span>Stock Transfer</span>
        </NavLink>

        <NavLink to="/discount" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="fas fa-percent"></i>
          </div>
          <span>Discount</span>
        </NavLink>

        <NavLink to="/tax" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <span>Tax</span>
        </NavLink>

        <NavLink to="/location" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <span>Location</span>
        </NavLink>
        </nav>
    </div>
  );
} 