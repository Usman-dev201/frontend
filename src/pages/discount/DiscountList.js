import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './Discount.css';

export default function DiscountList() {
  const [discounts, setDiscounts] = useState([
    { 
      id: 'DISC001',
      code: 'SUMMER20',
      status: 'active'
    },
    { 
      id: 'DISC002',
      code: 'WELCOME10',
      status: 'expired'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    status: 'active'
  });
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    code: '',
    status: ''
  });

  const handleAddDiscount = (e) => {
    e.preventDefault();
    if (newDiscount.code.trim()) {
      setDiscounts([...discounts, {
        id: `DISC${String(discounts.length + 1).padStart(3, '0')}`,
        code: newDiscount.code,
        status: newDiscount.status
      }]);
      setNewDiscount({ code: '', status: 'active' });
      setShowAddForm(false);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount.id);
    setEditForm({
      id: discount.id,
      code: discount.code,
      status: discount.status
    });
  };

  const handleSaveEdit = () => {
    if (editForm.code.trim()) {
      setDiscounts(discounts.map(item => 
        item.id === editingDiscount ? {
          ...item,
          code: editForm.code,
          status: editForm.status
        } : item
      ));
      setEditingDiscount(null);
      setEditForm({ id: '', code: '', status: '' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setDiscounts(discounts.filter(item => item.id !== id));
    }
  };

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="discount-list-container">
          <div className="discount-list-header">
            <h2>Discounts</h2>
            <button 
              className="add-discount-btn"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus"></i> Add Discount
            </button>
          </div>

          {showAddForm && (
            <div className="add-discount-form-container">
              <form onSubmit={handleAddDiscount} className="add-discount-form">
                <div className="form-fields">
                  <div className="form-group">
                    <label htmlFor="discountCode">Discount Code</label>
                    <input
                      type="text"
                      id="discountCode"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                      placeholder="Enter discount code"
                      className="discount-code-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="discountStatus">Status</label>
                    <select
                      id="discountStatus"
                      value={newDiscount.status}
                      onChange={(e) => setNewDiscount({ ...newDiscount, status: e.target.value })}
                      className="discount-select"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-check"></i> Save
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewDiscount({ code: '', status: 'active' });
                    }}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="discount-table-container">
            <table className="discount-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Discount Code</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => (
                  <tr key={discount.id}>
                    <td>{discount.id}</td>
                    <td>
                      {editingDiscount === discount.id ? (
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                          className="edit-input"
                        />
                      ) : (
                        discount.code
                      )}
                    </td>
                    <td>
                      {editingDiscount === discount.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="discount-select"
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      ) : (
                        <span className={`status-badge status-${discount.status}`}>
                          {discount.status}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-container">
                        {editingDiscount === discount.id ? (
                          <>
                            <button
                              type="button"
                              className="action-btn save-btn"
                              onClick={handleSaveEdit}
                            >
                              <i className="fas fa-save"></i> Save
                            </button>
                            <button
                              type="button"
                              className="action-btn cancel-btn"
                              onClick={() => setEditingDiscount(null)}
                            >
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(discount)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(discount.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 