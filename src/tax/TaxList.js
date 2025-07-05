import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import './TaxList.css';
import { useTax } from '../context/TaxContext';

export default function TaxList() {
  const { taxList, addTax, editTax, deleteTax, loading } = useTax();

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [editName, setEditName] = useState('');
  

  const handleAddTax = async (e) => {
    e.preventDefault();
    if (newTaxName.trim()) {
      try {
        await addTax(newTaxName);
        setNewTaxName('');
        setShowAddPopup(false);
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
            <div className="tax-list-buttons-row">
              <button className="tab-btn active-tab">Tax List</button>
              <button className="tab-btn" onClick={() => window.location.href = "/tax/manage"}>
                Manage Tax
              </button>
            </div>
            <button className="add-tax-btn" onClick={() => setShowAddPopup(true)}>
              <i className="fas fa-plus"></i> Add Tax
            </button>
          </div>

          {/* Tax Table */}
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

        {/* Add Tax Modal */}
        {showAddPopup && (
          <div className="popup-overlay">
            <div className="popup-form">
              <h3>Add New Tax</h3>
              <form onSubmit={handleAddTax}>
                <input
                  type="text"
                  value={newTaxName}
                  onChange={(e) => setNewTaxName(e.target.value)}
                  placeholder="Enter Tax Name"
                  className="tax-name-input"
                  autoFocus
                />
                <div className="form-buttons" style={{ marginTop: '15px' }}>
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-check"></i> Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddPopup(false);
                      setNewTaxName('');
                    }}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
