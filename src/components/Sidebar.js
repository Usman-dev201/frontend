import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaStore, FaTachometerAlt, FaUsers, FaChevronDown, FaChevronRight,
  FaUserFriends, FaUserShield, FaBox, FaList, FaPlus, FaTags,
  FaTrademark, FaBarcode, FaShoppingCart, FaUndo, FaTruck,
  FaExchangeAlt, FaPercent, FaFileInvoiceDollar, FaMapMarkerAlt,
  FaCashRegister, FaUser,FaHandshake, FaBullhorn, FaComments
} from "react-icons/fa";
import './Sidebar.css';

export default function Sidebar() {
const [expandedSections, setExpandedSections] = useState(() => {
  const saved = localStorage.getItem("expandedSections");
  return saved
    ? JSON.parse(saved)
    : { users: false, inventory: false, purchase: false, pos: false, crm: false, expense: false };
});


const toggleSection = (section) => {
  setExpandedSections((prev) => {
    const updated = { ...prev, [section]: !prev[section] };
    localStorage.setItem("expandedSections", JSON.stringify(updated));
    return updated;
  });
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
        
        {/* POS Section */}
        <div className="nav-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('pos')}
          >
            <div className="nav-icon">
              <FaCashRegister />
            </div>
            <span>POS</span>
            {expandedSections.pos ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {expandedSections.pos && (
            <div className="sub-items">
              <NavLink to="/sales/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaList />
                </div>
                <span>List Sales</span>
              </NavLink>
              <NavLink to="/sales/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaPlus />
                </div>
                <span>Add Sales</span>
              </NavLink>
              <NavLink to="/saleexchange/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaUndo />
                </div>
                <span>Sale Returns & Exchange</span>
              </NavLink>
              <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon">
                  <FaUser />
                </div>
                <span>Customers</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* CRM Section */}
        <div className="nav-section">
          <div className="section-header" onClick={() => toggleSection('crm')}>
            <div className="nav-icon"><FaHandshake /></div>
            <span>CRM</span>
            {expandedSections.crm ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {expandedSections.crm && (
            <div className="sub-items">
              <NavLink to="/crm/loyalty-programs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon"><FaPercent /></div>
                <span>Loyalty Programs</span>
              </NavLink>
              <NavLink to="/crm/marketingcampaigns" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon"><FaBullhorn /></div>
                <span>Marketing Campaigns</span>
              </NavLink>
              <NavLink to="/crm/feedbacks" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="nav-icon"><FaComments /></div>
                <span>Customer Feedbacks</span>
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
{/* Expense Section */}
<div className="nav-section">
  <div 
    className="section-header" 
    onClick={() => toggleSection('expense')}
  >
    <div className="nav-icon">
      <FaFileInvoiceDollar /> {/* You can change icon if desired */}
    </div>
    <span>Expense</span>
    {expandedSections.expense ? <FaChevronDown /> : <FaChevronRight />}
  </div>

  {expandedSections.expense && (
    <div className="sub-items">
      <NavLink to="/expense/list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <div className="nav-icon"><FaList /></div>
        <span>List Expense</span>
      </NavLink>

      <NavLink to="/expense/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <div className="nav-icon"><FaPlus /></div>
        <span>Add Expense</span>
      </NavLink>

      <NavLink 
        to="/expense/category" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon">
          <FaTags />
        </div>
        <span>Expense Category</span>
      </NavLink>
    </div>
  )}
</div>
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
