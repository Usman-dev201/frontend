// src/pages/purchase/ReturnPurchase.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';   // ✅ axios instance
import '../../styles/purchase/Purchase.css';

export default function ReturnPurchase() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch purchase returns on page load
  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get("/PurchaseReturn"); 
      setReturns(res.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to Add page
  const handleAddReturn = () => {
    navigate('/purchase/return/add');
  };

  // ✅ Navigate to Edit page with correct id
  const handleEdit = (id) => {
    if (!id) return;
    // Navigate to EditPurchaseReturn page
    navigate(`/purchase/return/edit/${id}`);
  };

  // ✅ Delete from backend and update UI
  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete return ID ${id}?`)) {
      try {
        await api.delete(`/PurchaseReturn/${id}`); // ✅ Backend integration
        // Remove from UI immediately
        setReturns((prev) => prev.filter((ret) => ret.purchaseReturnId !== id));
        alert("Purchase Return deleted successfully ✅");
      } catch (err) {
        console.error("Failed to delete return:", err.response?.data || err.message);
        alert("Failed to delete return. Please try again.");
      }
    }
  };

  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container">
        <div className="purchase-header">
          <h2>Purchase Return List</h2>
          <button 
            className="btn btn-primary"
            onClick={handleAddReturn}
          >
            <i className="fas fa-plus"></i> Add Purchase Return
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading returns...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Date</th>
                  <th>Purchase ID</th>
                  <th>Grand Total</th>
                  <th>Amount Returned</th>
                  <th>Payment Due</th>
                  <th>Payment Status</th>
                  <th>Refund Status</th>
                  <th>Reason for Refund</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret.purchaseReturnId}>
                    <td>{ret.purchaseReturnId}</td>
                    <td className="purchase-date">{ret.date}</td>
                    <td>{ret.purchaseId}</td>
                    <td className="purchase-amount">
                      ${ret.grandTotal?.toFixed(2)}
                    </td>
                    <td className="purchase-amount">
                      ${ret.amountReturned?.toFixed(2)}
                    </td>
                    <td className="purchase-date">{ret.paymentDue}</td>
                    <td>
                      <span className={`status-badge status-${ret.paymentStatus?.toLowerCase()}`}>
                        {ret.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${ret.refundStatus?.toLowerCase()}`}>
                        {ret.refundStatus}
                      </span>
                    </td>
                    <td className="return-reason">{ret.reasonforRefund}</td>
                    <td>
                      <div className="action-buttons">
                        {/* ✅ Edit Button */}
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleEdit(ret.purchaseReturnId)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>

                        {/* ✅ Delete Button */}
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(ret.purchaseReturnId)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                      No purchase returns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
