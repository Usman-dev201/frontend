import React, { useState } from 'react';
import { useBarcode } from '../../context/BarcodeContext';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './BarcodeList.css';

export default function BarcodeList() {
  const {
    barcodes,
    addBarcode,
    updateBarcode,
    deleteBarcode
  } = useBarcode();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBarcodeType, setNewBarcodeType] = useState('');
  const [editingBarcode, setEditingBarcode] = useState(null);
  const [editForm, setEditForm] = useState({ barcodeType: '' });

  const handleAddBarcode = async (e) => {
    e.preventDefault();
    if (!newBarcodeType.trim()) return;
    await addBarcode(newBarcodeType);
    setNewBarcodeType('');
    setShowAddForm(false);
  };

  const handleEdit = (barcode) => {
    setEditingBarcode(barcode.barcodeId);
    setEditForm({ barcodeType: barcode.barcodeType });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.barcodeType.trim()) return;
    await updateBarcode(editingBarcode, editForm.barcodeType);
    setEditingBarcode(null);
  };

  const handleDelete = async (barcodeId) => {
    if (window.confirm('Are you sure you want to delete this barcode?')) {
      await deleteBarcode(barcodeId);
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

        {/* Add Barcode Modal */}
{showAddForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Add New Barcode</h3>
      <form onSubmit={handleAddBarcode}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter Barcode Type"
            value={newBarcodeType}
            onChange={(e) => setNewBarcodeType(e.target.value)}
            className="form-control"
            autoFocus
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
                          onChange={(e) => setEditForm({ barcodeType: e.target.value })}
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
                          <button className="action-btn edit-btn" onClick={handleSaveEdit}>
                            <i className="fas fa-check"></i> Save
                          </button>
                          <button className="action-btn delete-btn" onClick={() => setEditingBarcode(null)}>
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button className="action-btn edit-btn" onClick={() => handleEdit(barcode)}>
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(barcode.barcodeId)}>
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
