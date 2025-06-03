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
              padding: '8px 16px',
              fontSize: '14px',
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
          <div className="form-container" style={{
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                {isEditing ? 'Edit Supplier' : 'Add Supplier'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Supplier Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

              {/* Submit and Cancel Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
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
