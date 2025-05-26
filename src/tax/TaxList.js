import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import './TaxList.css';

export default function TaxList() {
  const [taxList, setTaxList] = useState([
    { 
      id: 'TAX001',
      name: 'VAT',
      percentage: '20%',
      effectiveDate: '2024-01-01',
      location: 'National'
    },
    { 
      id: 'TAX002',
      name: 'Sales Tax',
      percentage: '18%',
      effectiveDate: '2024-01-01',
      location: 'State'
    },
    { 
      id: 'TAX003',
      name: 'Import Duty',
      percentage: '15%',
      effectiveDate: '2024-01-01',
      location: 'International'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [editingTax, setEditingTax] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    name: ''
  });

  const handleAddTax = (e) => {
    e.preventDefault();
    if (newTaxName.trim()) {
      setTaxList([...taxList, { 
        id: `TAX${String(taxList.length + 1).padStart(3, '0')}`,
        name: newTaxName,
        percentage: '',
        effectiveDate: '',
        location: ''
      }]);
      setNewTaxName('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (tax) => {
    setEditingTax(tax.id);
    setEditForm({
      id: tax.id,
      name: tax.name
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editForm.name.trim()) {
      setTaxList(taxList.map(item => 
        item.id === editingTax ? {
          ...item,
          name: editForm.name
        } : item
      ));
      setEditingTax(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      setTaxList(taxList.filter(item => item.id !== id));
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
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        {editingTax === item.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="edit-input"
                            autoFocus
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td>{item.location || '-'}</td>
                      <td>{item.percentage || '-'}</td>
                      <td>{item.effectiveDate || '-'}</td>
                      <td>
                        {editingTax === item.id ? (
                          <div className="action-buttons-container">
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
                              onClick={() => setEditingTax(null)}
                            >
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons-container">
                            <button 
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(item)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button 
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                        )}
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