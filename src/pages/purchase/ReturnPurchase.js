import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import '../../styles/purchase/Purchase.css';

export default function ReturnPurchase() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([
    {
      id: 'RET001',
      date: '2024-01-15',
      purchaseId: 'PUR001',
      grandTotal: 1500.00,
      amountReturned: 500.00,
      paymentDue: '2024-02-15',
      paymentStatus: 'Pending',
      refundStatus: 'Processing',
      refundReason: 'Damaged products'
    },
    {
      id: 'RET002',
      date: '2024-01-16',
      purchaseId: 'PUR003',
      grandTotal: 2000.00,
      amountReturned: 750.00,
      paymentDue: '2024-02-16',
      paymentStatus: 'Paid',
      refundStatus: 'Completed',
      refundReason: 'Wrong items received'
    }
  ]);

  const handleAddReturn = () => {
    navigate('/purchase/return/add');
  };

  const handleEdit = (id) => {
    navigate(`/purchase/return/edit/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this return?')) {
      // Remove the return from the list
      setReturns(returns.filter(ret => ret.id !== id));
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
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
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
                <tr key={ret.id}>
                  <td>{ret.id}</td>
                  <td className="purchase-date">{ret.date}</td>
                  <td>{ret.purchaseId}</td>
                  <td className="purchase-amount">
                    ${ret.grandTotal.toFixed(2)}
                  </td>
                  <td className="purchase-amount">
                    ${ret.amountReturned.toFixed(2)}
                  </td>
                  <td className="purchase-date">{ret.paymentDue}</td>
                  <td>
                    <span className={`status-badge status-${ret.paymentStatus.toLowerCase()}`}>
                      {ret.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${ret.refundStatus.toLowerCase()}`}>
                      {ret.refundStatus}
                    </span>
                  </td>
                  <td className="return-reason">{ret.refundReason}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEdit(ret.id)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(ret.id)}
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
        </div>
      </div>
    </div>
  );
}