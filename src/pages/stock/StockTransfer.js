import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './StockTransfer.css';

export default function StockTransfer() {
  const navigate = useNavigate();
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [stockTransfers, setStockTransfers] = useState([
    {
      id: 'ST001',
      date: '2024-01-15',
      fromLocation: 'Warehouse A',
      toLocation: 'Store B',
      shippingCharges: 150,
      additionalNotes: 'Handle with care',
      status: 'completed',
      totalAmount: 2500
    },
    {
      id: 'ST002',
      date: '2024-01-16',
      fromLocation: 'Store B',
      toLocation: 'Store C',
      shippingCharges: 200,
      additionalNotes: 'Urgent delivery',
      status: 'pending',
      totalAmount: 3200
    }
  ]);

  const [editForm, setEditForm] = useState({
    id: '',
    date: '',
    fromLocation: '',
    toLocation: '',
    status: '',
    shippingCharges: '',
    additionalNotes: '',
    totalAmount: ''
  });

  const calculateTotalAmount = (transfer) => {
    // This is a placeholder calculation. Adjust according to your business logic
    return Number(transfer.shippingCharges) + 1000; // Base amount + shipping
  };

  const handleEdit = (id) => {
    navigate(`/stock/transfer/edit/${id}`);
  };

  const handleSaveEdit = () => {
    if (editForm.fromLocation && editForm.toLocation) {
      setStockTransfers(stockTransfers.map(item =>
        item.id === editingTransfer ? {
          ...editForm,
          totalAmount: calculateTotalAmount(editForm)
        } : item
      ));
      setEditingTransfer(null);
      setEditForm({
        id: '',
        date: '',
        fromLocation: '',
        toLocation: '',
        status: '',
        shippingCharges: '',
        additionalNotes: '',
        totalAmount: ''
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      setStockTransfers(stockTransfers.filter(item => item.id !== id));
    }
  };

  return (
    <div className="stock-transfer-page">
      <Topbar />
      <Sidebar />
      <div className="stock-transfer-container">
        <div className="stock-transfer-header">
          <h2>Stock Transfer</h2>
          <button 
            className="add-transfer-btn"
            onClick={() => navigate('/stock/transfer/add')}
          >
            <i className="fas fa-plus"></i>
            Add Stock Transfer
          </button>
        </div>

        <div className="stock-transfer-table-container">
          <table className="stock-transfer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Shipping Charges</th>
                <th>Additional Notes</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockTransfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>{transfer.id}</td>
                  <td>{transfer.date}</td>
                  <td>{transfer.fromLocation}</td>
                  <td>{transfer.toLocation}</td>
                  <td>₹{transfer.shippingCharges}</td>
                  <td>{transfer.additionalNotes}</td>
                  <td>
                    {editingTransfer === transfer.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="transfer-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`status-badge status-${transfer.status}`}>
                        {transfer.status}
                      </span>
                    )}
                  </td>
                  <td>₹{transfer.totalAmount}</td>
                  <td>
                    <div className="action-buttons-container">
                      {editingTransfer === transfer.id ? (
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
                            onClick={() => setEditingTransfer(null)}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(transfer.id)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(transfer.id)}
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