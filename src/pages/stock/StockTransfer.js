import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import './StockTransfer.css';

export default function StockTransfer() {
  const navigate = useNavigate();
  const [stockTransfers, setStockTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch stock transfers from backend
  useEffect(() => {
    const fetchStockTransfers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/StockTransfer');
        setStockTransfers(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load stock transfers.');
        setLoading(false);
      }
    };

    fetchStockTransfers();
  }, []);

  // ✅ Edit handler
  const handleEdit = (transfer) => {
    navigate(`/stock/transfer/edit/${transfer.transferId}`);
  };

  // ✅ Delete handler (fixed)
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await api.delete(`/StockTransfer/${id}`);
        setStockTransfers((prev) =>
          prev.filter((item) => item.transferId !== id) // ✅ use transferId
        );
      } catch (err) {
        console.error(err);
        alert('Failed to delete transfer.');
      }
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
            <i className="fas fa-plus"></i> Add Stock Transfer
          </button>
        </div>

        {loading ? (
          <p>Loading stock transfers...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
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
                {stockTransfers.length > 0 ? (
                  stockTransfers.map((transfer) => (
                    <tr key={transfer.transferId}>
                      <td>{transfer.transferId}</td>
                      <td>{transfer.date}</td>
                      <td>{transfer.fromLocation?.locationName || transfer.fromLocation}</td>
                      <td>{transfer.toLocation?.locationName || transfer.toLocation}</td>
                      <td>₹{transfer.shippingCharges}</td>
                      <td>{transfer.additionalNotes}</td>
                      <td>
                        <span className={`status-badge status-${transfer.status}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td>₹{transfer.totalAmount}</td>
                      <td>
                        <div className="action-buttons-container">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(transfer)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(transfer.transferId)} // ✅ fixed
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>
                      No stock transfers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
