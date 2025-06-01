import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './Discount.css';
import { useDiscount } from '../../context/DiscountContext'; // adjust path as needed

export default function DiscountList() {
  const {
    discounts,
    statuses,
    addDiscount,
    editDiscount,
    deleteDiscount,
    loading,
    error,
  } = useDiscount();

  const [showAddForm, setShowAddForm] = useState(false);
 const [newDiscount, setNewDiscount] = useState({
  discountCode: '',
  status: 'Active'
});
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    discountCode: '',
    status: ''
  });

 const handleAddDiscount = async (e) => {
  e.preventDefault();
  if (!newDiscount.discountCode.trim()) return;

  try {
    await addDiscount(newDiscount);
    setNewDiscount({ discountCode: '', status: 'Active' });
    setShowAddForm(false);
  } catch (err) {
    alert('Error adding discount.');
  }
};
 const handleEdit = (discount) => {
  setEditingDiscount(discount.discountId);
  setEditForm({
    id: discount.discountId,
    discountCode: discount.discountCode,
    status: discount.status
  });
};
 const handleSaveEdit = async () => {
  if (!editForm.discountCode.trim()) return;

  try {
    await editDiscount(editForm.id, {
      discountCode: editForm.discountCode,
      status: editForm.status.charAt(0).toUpperCase() + editForm.status.slice(1).toLowerCase()
    });
    setEditingDiscount(null);
  } catch (err) {
    alert('Error saving changes: ' + (err.response?.data?.message || err.message));
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await deleteDiscount(id);
      } catch (err) {
        alert('Error deleting discount.');
      }
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
  value={newDiscount.discountCode}
  onChange={(e) => setNewDiscount({ ...newDiscount, discountCode: e.target.value })}
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
  {(statuses.length ? statuses : ['Active', 'Expired']).map(status => (
    <option key={status} value={status}>{status}</option>
  ))}
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

          {loading ? (
            <p>Loading discounts...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <div className="discount-table-container">
              <table className="discount-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Discount Code</th>
                    <th>Status</th>
                     <th>Discount Type</th>
      <th>Discount Percentage</th>
      <th>Discount Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.discountId}>
                      <td>{discount.discountId}</td>
                      <td>
                        {editingDiscount === discount.discountId? (
                        <input
  type="text"
  value={editForm.discountCode}
  onChange={(e) => setEditForm({ ...editForm, discountCode: e.target.value })}
  className="edit-input"
/>
                        ) : (
                          discount.discountCode || discount.code
                        )}
                      </td>
                     <td>
  {editingDiscount === discount.discountId ? (
    <select
      value={editForm.status}
      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
      className="discount-select"
    >
      {(statuses.length ? statuses : ['Active', 'Expired']).map(status => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  ) : (
    <span className={`status-badge status-${discount.status}`}>
      {discount.status}
    </span>
  )}
</td>
<td>{discount.discountType || '-'}</td>
<td>{discount.discountPercentage != null ? discount.discountPercentage : '-'}</td>
<td>{discount.discountAmount != null ? discount.discountAmount : '-'}</td>
                      <td>
                        <div className="action-buttons-container">
                          {editingDiscount === discount.discountId ? (
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
                                onClick={() => handleDelete(discount.discountId)}
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
          )}
        </div>
      </div>
    </div>
  );
}
