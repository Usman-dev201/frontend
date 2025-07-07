import React from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { usePurchase } from '../../context/PurchaseContext';
import '../../styles/purchase/Purchase.css';

export default function ListPurchase() {
  const navigate = useNavigate();
  const { purchases, deletePurchase, suppliers, locations } = usePurchase();
const getSupplierName = (id) => {
    const supplier = suppliers.find(s => s.supplierId === id);
    return supplier ? supplier.supplierName : 'N/A';
  };

  const getLocationName = (id) => {
    const location = locations.find(l => l.locationId === id);
    return location ? location.locationName : 'N/A';
  };
  const handleAddPurchase = () => {
    navigate('/purchase/add');
  };

 const handleEdit = (id) => {
  navigate(`/purchase/edit/${id}`);
};

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container">
        <div className="purchase-header">
          <h2>Purchase List</h2>
          <button 
            className="btn btn-primary"
            onClick={handleAddPurchase}
          >
            <i className="fas fa-plus"></i> Add Purchase
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Location</th>
                <th>Total Amount</th>
                <th>Grand Total</th>
                <th>Amount Paid</th>
                <th>Payment Due</th>
                <th>Payment Status</th>
                <th>Purchase Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.purchaseId}>
                  <td>{purchase.purchaseId}</td>
                  <td className="purchase-date">{purchase.date}</td>
                 <td>{getSupplierName(purchase.supplierId)}</td>
    <td>{getLocationName(purchase.locationId)}</td>
                  <td className="purchase-amount">
                    Rs {purchase.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="purchase-amount">
                    Rs {purchase.grandTotal?.toFixed(2) || '0.00'}
                  </td>
                  <td className="purchase-amount">
                    Rs {purchase.amountPaid?.toFixed(2) || '0.00'}
                  </td>
                  <td className="purchase-date">{purchase.paymentDue || '-'}</td>
                  <td>
                    <span className={`status-badge status-${purchase.paymentStatus?.toLowerCase() || 'pending'}`}>
                      {purchase.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${purchase.purchaseStatus?.toLowerCase() || 'pending'}`}>
                      {purchase.purchaseStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                     <button 
  className="btn btn-primary"
  onClick={() => handleEdit(purchase.purchaseId)}  
>
  <i className="fas fa-edit"></i> Edit
</button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
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