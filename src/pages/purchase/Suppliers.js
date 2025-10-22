import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useSupplier } from '../../context/SupplierContext';
import '../../styles/purchase/Purchase.css';

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplier();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    email: '',
    contactNo: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateSupplier(formData);
    } else {
      addSupplier(formData);
    }
    handleCloseForm();
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setFormData({
      supplierId: '',
      supplierName: '',
      email: '',
      contactNo: '',
      address: ''
    });
  };

  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container">
        <div className="purchase-header">
          <h2>Suppliers</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setFormData({
                supplierId: '',
                supplierName: '',
                email: '',
                contactNo: '',
                address: ''
              });
            }}
           style={{
  minHeight: '52px',
  padding: '12px 20px',
  fontSize: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}}
          >
            <i className="fas fa-plus"></i>
            Add Supplier
          </button>
        </div>

      {showForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>{isEditing ? 'Edit Supplier' : 'Add Supplier'}</h3>
        
      </div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Supplier Name */}
          <div className="form-group">
            <label htmlFor="supplierName">Supplier Name</label>
            <input
              type="text"
              id="supplierName"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              required
            />
          </div>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {/* Phone */}
          <div className="form-group">
            <label htmlFor="contactNo">Phone</label>
            <input
              type="tel"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              required
            />
          </div>
          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <button type="submit" className="btn btn-success">
            <i className="fas fa-save"></i>
            {isEditing ? 'Update Supplier' : 'Save Supplier'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
            <i className="fas fa-times"></i>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
        {/* Supplier List Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.supplierId}>
                  <td>{supplier.supplierId}</td>
                  <td>{supplier.supplierName}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.contactNo}</td>
                  <td>{supplier.address}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary" onClick={() => handleEdit(supplier)}>
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(supplier.supplierId)}>
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
