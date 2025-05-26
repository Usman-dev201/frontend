import React, { useState } from 'react';
import './DiscountListSection.css';

export default function DiscountListSection() {
  // Mock data for demonstration
  const [discountList, setDiscountList] = useState([
    { 
      id: 'DISC001',
      code: 'SUMMER20'
    },
    { 
      id: 'DISC002',
      code: 'WELCOME10'
    },
    { 
      id: 'DISC003',
      code: 'HOLIDAY25'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    code: ''
  });

  const handleAddDiscount = (e) => {
    e.preventDefault();
    if (newDiscountCode.trim()) {
      setDiscountList([...discountList, { 
        id: `DISC${String(discountList.length + 1).padStart(3, '0')}`,
        code: newDiscountCode
      }]);
      setNewDiscountCode('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount.id);
    setEditForm({
      id: discount.id,
      code: discount.code
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setDiscountList(discountList.map(item => 
      item.id === editingDiscount ? {
        ...item,
        code: editForm.code
      } : item
    ));
    setEditingDiscount(null);
  };

  const handleDelete = (id) => {
    setDiscountList(discountList.filter(item => item.id !== id));
  };

  return (
    <div className="tax-list-container">
      <div className="tax-list-header">
        <h2>Discount List</h2>
        <button 
          className="add-tax-btn"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i> Add Discount
        </button>
      </div>

      {showAddForm && (
        <div className="add-tax-form-container">
          <form onSubmit={handleAddDiscount} className="add-tax-form">
            <input
              type="text"
              value={newDiscountCode}
              onChange={(e) => setNewDiscountCode(e.target.value)}
              placeholder="Enter Discount Code"
              className="tax-name-input"
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
                  setNewDiscountCode('');
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tax-list-content">
        <div className="tax-table-container">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Discount Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountList.map((item) => (
                <tr key={item.id}>
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
  );
} 