
import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import './TaxList.css';
import { useTax } from '../context/TaxContext';

export default function TaxList() {
  const { taxList, addTax, editTax, deleteTax, loading } = useTax();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAddTax = async (e) => {
  e.preventDefault();
  if (newTaxName.trim()) {
    try {
      await addTax(newTaxName);
      setNewTaxName('');
      setShowAddForm(false);
    } catch (error) {
  console.error('Add tax failed:', error);
  alert(error?.response?.data?.message || 'Failed to add tax. Please try again.');
}
  }
};

  const handleEdit = (tax) => {
    setEditingTaxId(tax.taxId);
    setEditName(tax.taxName);
  };

 const handleSaveEdit = async (e) => {
  e.preventDefault();
  if (editName.trim()) {
    await editTax(editingTaxId, editName); 
    setEditingTaxId(null);
  }
};

 const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this tax?')) {
    await deleteTax(id);
  }
};

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="tax-list-container">
          <div className="tax-list-header">
            <h2>Tax List</h2>
            <button className="add-tax-btn" onClick={() => setShowAddForm(true)}>
              <i className="fas fa-plus"></i> Add Tax
            </button>
          </div>

          {showAddForm && (
            <div className="add-tax-form-container">
              <form onSubmit={handleAddTax} className="add-tax-form">
                <div className="input-container">
                  <input
                    type="text"
                    value={newTaxName}
                    onChange={(e) => setNewTaxName(e.target.value)}
                    placeholder="Enter Tax Name"
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
                        setNewTaxName('');
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="tax-list-content">
           <div className="tax-table-container">
  {loading ? (
    <p>Loading taxes...</p>
  ) : (
    <table className="tax-table">
      <thead>
        <tr>
          <th className="equal-width">Tax ID</th>
          <th className="equal-width">Tax Name</th>
          <th className="equal-width">Location</th>
          <th className="equal-width">Percentage</th>
          <th className="equal-width">Effective Date</th>
          <th className="equal-width">Actions</th>
        </tr>
      </thead>
      <tbody>
        {taxList.map((item) => (
          <tr key={item.taxId}>
            <td>{item.taxId}</td>
            <td>
              {editingTaxId === item.taxId ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="edit-input"
                  autoFocus
                />
              ) : (
                item.taxName
              )}
            </td>
            <td>{item.location || '-'}</td>
            <td>{item.percentage || '-'}</td>
            <td>{item.effectiveDate || '-'}</td>
            <td>
              {editingTaxId === item.taxId ? (
                <div className="action-buttons-container">
                  <button type="button" className="action-btn save-btn" onClick={handleSaveEdit}>
                    <i className="fas fa-save"></i> Save
                  </button>
                  <button type="button" className="action-btn cancel-btn" onClick={() => setEditingTaxId(null)}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              ) : (
                <div className="action-buttons-container">
                  <button type="button" className="action-btn edit-btn" onClick={() => handleEdit(item)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(item.taxId)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

          </div>
        </div>
      </div>
    </div>
  );
}
