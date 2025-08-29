import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaStore, FaTachometerAlt, FaUsers, FaChevronDown, FaChevronRight,
  FaUserFriends, FaUserShield, FaBox, FaList, FaPlus, FaTags,
  FaTrademark, FaBarcode, FaShoppingCart, FaUndo, FaTruck,
  FaExchangeAlt, FaPercent, FaFileInvoiceDollar, FaMapMarkerAlt
} from "react-icons/fa";
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
          <FaStore />
          <h2>Retail MS</h2>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <FaTachometerAlt />
          </div>
          <span>Dashboard</span>
        </NavLink>

        {/* Users Section */}
        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('users')}
          >
            <div className="nav-icon">
              <FaUsers />
            </div>
            <span>Users</span>
            {expandedSections.users ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {expandedSections.users && (
            <div className="sub-items">
              <NavLink to="/users/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaUserFriends />
                </div>
                <span>List Users</span>
              </NavLink>
              <NavLink to="/users/roles" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaUserShield />
                </div>
                <span>Roles</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('inventory')}
          >
            <div className="nav-icon">
              <FaBox />
            </div>
            <span>Inventory</span>
            {expandedSections.inventory ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {expandedSections.inventory && (
            <div className="sub-items">
              <NavLink to="/product/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaList />
                </div>
                <span>List Product</span>
              </NavLink>
              <NavLink to="/product/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaPlus />
                </div>
                <span>Add Product</span>
              </NavLink>
              <NavLink to="/categories" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaTags />
                </div>
                <span>Categories</span>
              </NavLink>
              <NavLink to="/brands" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaTrademark />
                </div>
                <span>Brands</span>
              </NavLink>
              <NavLink to="/barcode/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaBarcode />
                </div>
                <span>Barcode</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Purchase Section */}
        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('purchase')}
          >
            <div className="nav-icon">
              <FaShoppingCart />
            </div>
            <span>Purchase</span>
            {expandedSections.purchase ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {expandedSections.purchase && (
            <div className="sub-items">
              <NavLink to="/purchase/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaList />
                </div>
                <span>List Purchase</span>
              </NavLink>
              <NavLink to="/purchase/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaPlus />
                </div>
                <span>Add Purchase</span>
              </NavLink>
              <NavLink to="/purchase/return" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaUndo />
                </div>
                <span>Return Purchase</span>
              </NavLink>
              <NavLink to="/purchase/suppliers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaTruck />
                </div>
                <span>Suppliers</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Other Items */}
        <NavLink to="/stock/transfer" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <FaExchangeAlt />
          </div>
          <span>Stock Transfer</span>
        </NavLink>

        <NavLink to="/discount" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <FaPercent />
          </div>
          <span>Discount</span>
        </NavLink>

        <NavLink to="/tax" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <FaFileInvoiceDollar />
          </div>
          <span>Tax</span>
        </NavLink>

        <NavLink to="/location" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <FaMapMarkerAlt />
          </div>
          <span>Location</span>
        </NavLink>
      </nav>
    </div>
  );
}
