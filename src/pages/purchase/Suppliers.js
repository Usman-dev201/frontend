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
    id: null,
    name: '',
    email: '',
    phone: '',
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
      id: null,
      name: '',
      email: '',
      phone: '',
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
            onClick={() => setShowForm(true)}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="name" style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>Supplier Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      height: '40px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="email" style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      height: '40px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="phone" style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      height: '40px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="address" style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      height: '40px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '15px',
                justifyContent: 'flex-end'
              }}>
                <button type="submit" className="btn btn-success" style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  cursor: 'pointer',
                  height: '40px',
                  minWidth: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <i className="fas fa-save"></i>
                  {isEditing ? 'Update Supplier' : 'Save Supplier'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseForm}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    cursor: 'pointer',
                    height: '40px',
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container" style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table className="data-table" style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>ID</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Supplier Name</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Email</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Phone</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Address</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 15px' }}>{supplier.id}</td>
                  <td style={{ padding: '12px 15px' }}>{supplier.name}</td>
                  <td style={{ padding: '12px 15px' }}>{supplier.email}</td>
                  <td style={{ padding: '12px 15px' }}>{supplier.phone}</td>
                  <td style={{ padding: '12px 15px' }}>{supplier.address}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEdit(supplier)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#007bff',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(supplier.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
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