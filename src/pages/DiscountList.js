import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import './DiscountList.css';

export default function DiscountList() {
  // Mock data for demonstration
  const [discountList, setDiscountList] = useState([
    { 
      id: 'DISC001',
      code: 'SUMMER20',
      status: 'Active'
    },
    { 
      id: 'DISC002',
      code: 'WELCOME10',
      status: 'Active'
    },
    { 
      id: 'DISC003',
      code: 'HOLIDAY25',
      status: 'Expired'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiscountId, setNewDiscountId] = useState('');
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    code: '',
    status: 'Active'
  });

  const handleAddDiscount = (e) => {
    e.preventDefault();
    if (newDiscountId.trim()) {
      setDiscountList([...discountList, { 
        id: newDiscountId,
        code: newDiscountId,
        status: 'Active'
      }]);
      setNewDiscountId('');
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

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setDiscountList(discountList.map(item => 
      item.id === editingDiscount ? {
        ...item,
        code: editForm.code,
        status: editForm.status
      } : item
    ));
    setEditingDiscount(null);
  };

  const handleDelete = (id) => {
    setDiscountList(discountList.filter(item => item.id !== id));
  };

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="discount-list-container">
          <div className="discount-list-header">
            <h2>Discount List</h2>
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
                <input
                  type="text"
                  value={newDiscountId}
                  onChange={(e) => setNewDiscountId(e.target.value)}
                  placeholder="Enter Discount ID"
                  className="discount-id-input"
                />
                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-check"></i> Save
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewDiscountId('');
                    }}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="discount-list-content">
            <div className="discount-table-container">
              <table className="discount-table">
                <thead>
                  <tr>
                    <th>Discount ID</th>
                    <th>Discount Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discountList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        {editingDiscount === item.id ? (
                          <input
                            type="text"
                            value={editForm.code}
                            onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                            className="edit-input"
                          />
                        ) : (
                          item.code
                        )}
                      </td>
                      <td>
                        {editingDiscount === item.id ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            className="edit-select"
                          >
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingDiscount === item.id ? (
                            <>
                              <button 
                                className="save-btn"
                                onClick={handleSaveEdit}
                              >
                                <i className="fas fa-save"></i> Save
                              </button>
                              <button 
                                className="cancel-btn"
                                onClick={() => setEditingDiscount(null)}
                              >
                                <i className="fas fa-times"></i> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="edit-btn"
                                onClick={() => handleEdit(item)}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDelete(item.id)}
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
    </div>
  );
} 