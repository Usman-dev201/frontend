import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './BarcodeList.css';

export default function BarcodeList() {
  const [barcodes, setBarcodes] = useState([
    {
      barcodeId: 'BC001',
      barcodeType: 'Code128'
    },
    {
      barcodeId: 'BC002',
      barcodeType: 'QR Code'
    },
    {
      barcodeId: 'BC003',
      barcodeType: 'EAN-13'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBarcodeType, setNewBarcodeType] = useState('');
  const [editingBarcode, setEditingBarcode] = useState(null);
  const [editForm, setEditForm] = useState({
    barcodeId: '',
    barcodeType: ''
  });

  const handleAddBarcode = (e) => {
    e.preventDefault();
    if (newBarcodeType.trim()) {
      const newBarcode = {
        barcodeId: `BC${String(barcodes.length + 1).padStart(3, '0')}`,
        barcodeType: newBarcodeType.trim()
      };
      setBarcodes([...barcodes, newBarcode]);
      setNewBarcodeType('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (barcode) => {
    setEditingBarcode(barcode.barcodeId);
    setEditForm({
      barcodeId: barcode.barcodeId,
      barcodeType: barcode.barcodeType
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editForm.barcodeType.trim()) {
      setBarcodes(barcodes.map(barcode => 
        barcode.barcodeId === editingBarcode ? {
          ...barcode,
          barcodeType: editForm.barcodeType.trim()
        } : barcode
      ));
      setEditingBarcode(null);
    }
  };

  const handleDelete = (barcodeId) => {
    if (window.confirm('Are you sure you want to delete this barcode?')) {
      setBarcodes(barcodes.filter(barcode => barcode.barcodeId !== barcodeId));
    }
  };

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Barcode List</h1>
            <button className="add-button" onClick={() => setShowAddForm(true)}>
              <i className="fas fa-plus"></i> Add Barcode
            </button>
          </div>

          {showAddForm && (
            <div className="add-form">
              <form onSubmit={handleAddBarcode}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter Barcode Type"
                    value={newBarcodeType}
                    onChange={(e) => setNewBarcodeType(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    <i className="fas fa-check"></i> Save
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewBarcodeType('');
                    }}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Barcode ID</th>
                  <th>Barcode Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {barcodes.map(barcode => (
                  <tr key={barcode.barcodeId}>
                    <td>{barcode.barcodeId}</td>
                    <td>
                      {editingBarcode === barcode.barcodeId ? (
                        <input
                          type="text"
                          value={editForm.barcodeType}
                          onChange={(e) => setEditForm({...editForm, barcodeType: e.target.value})}
                          className="edit-input"
                          autoFocus
                        />
                      ) : (
                        barcode.barcodeType
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingBarcode === barcode.barcodeId ? (
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit-btn"
                            onClick={handleSaveEdit}
                          >
                            <i className="fas fa-check"></i> Save
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => setEditingBarcode(null)}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(barcode)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(barcode.barcodeId)}
                          >
                            <i className="fas fa-trash-alt"></i> Delete
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
  );
} 