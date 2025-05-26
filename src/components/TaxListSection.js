import React, { useState } from 'react';
import './TaxListSection.css';

export default function TaxListSection() {
  // Mock data for demonstration
  const [taxList, setTaxList] = useState([
    { 
      id: 'TAX001',
      name: 'VAT',
      rate: '20%',
      status: 'Active'
    },
    { 
      id: 'TAX002',
      name: 'GST',
      rate: '18%',
      status: 'Active'
    },
    { 
      id: 'TAX003',
      name: 'Service Tax',
      rate: '15%',
      status: 'Inactive'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [editingTax, setEditingTax] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    rate: '',
    status: 'Active'
  });

  const handleAddTax = (e) => {
    e.preventDefault();
    if (newTaxName.trim()) {
      setTaxList([...taxList, { 
        id: `TAX${String(taxList.length + 1).padStart(3, '0')}`,
        name: newTaxName,
        rate: '0%',
        status: 'Active'
      }]);
      setNewTaxName('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (tax) => {
    setEditingTax(tax.id);
    setEditForm({
      id: tax.id,
      name: tax.name,
      rate: tax.rate,
      status: tax.status
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setTaxList(taxList.map(item => 
      item.id === editingTax ? {
        ...item,
        name: editForm.name,
        rate: editForm.rate,
        status: editForm.status
      } : item
    ));
    setEditingTax(null);
  };

  const handleDelete = (id) => {
    setTaxList(taxList.filter(item => item.id !== id));
  };

  return (
    <div className="tax-list-container">
      <div className="tax-list-header">
        <h2>Tax List</h2>
        <button 
          className="add-tax-btn"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i> Add Tax
        </button>
      </div>

      {showAddForm && (
        <div className="add-tax-form-container">
          <form onSubmit={handleAddTax} className="add-tax-form">
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
          </form>
        </div>
      )}

      <div className="tax-list-content">
        <div className="tax-table-container">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Tax ID</th>
                <th>Tax Name</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxList.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {editingTax === item.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    {editingTax === item.id ? (
                      <input
                        type="text"
                        value={editForm.rate}
                        onChange={(e) => setEditForm({...editForm, rate: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      item.rate
                    )}
                  </td>
                  <td>
                    {editingTax === item.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="edit-select"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingTax === item.id ? (
                        <>
                          <button 
                            className="save-btn"
                            onClick={handleSaveEdit}
                          >
                            <i className="fas fa-save"></i> Save
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={() => setEditingTax(null)}
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