import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './Discount.css';
import { useDiscount } from '../../context/DiscountContext';

export default function DiscountList() {
  const {
    discounts,
     fetchDiscounts, 
    addDiscount,
    editDiscount,
    deleteDiscount,
    discountTypes,
    loading,
 
  } = useDiscount();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    discountId: '',
    discountCode: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    discountType: '',
    discountAmount: '',
    discountPercentage: '',
  });

  // Open modal for adding
  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({
      discountId: '',
      discountCode: '',
      status: 'Active',
      startDate: '',
      endDate: '',
      discountType: '',
      discountAmount: '',
      discountPercentage: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (discount) => {
    setIsEditing(true);
    setFormData({
      discountId: discount.discountId,
      discountCode: discount.discountCode || '',
      status: discount.status || 'Active',
      startDate: discount.startDate || '',
      endDate: discount.endDate || '',
      discountType: discount.discountType || '',
      discountAmount: discount.discountAmount || '',
      discountPercentage: discount.discountPercentage || '',
    });
    setShowModal(true);
  };

 const handleDelete = async (discount) => {
  // ✅ Prevent deleting Active discounts
  if (discount.status === 'Active') {
    alert('⚠️ Cannot delete this discount because its status is Active.');
    return;
  }

  if (window.confirm('Are you sure you want to delete this discount?')) {
    try {
      await deleteDiscount(discount.discountId);
      alert('✅ Discount deleted successfully!');

      // Refresh list after deletion
      if (typeof fetchDiscounts === 'function') {
        await fetchDiscounts();
      }
    } catch (err) {
      console.error('Error deleting discount:', err);
      alert('❌ Error deleting discount. Please try again.');
    }
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formattedData = {
      ...formData,
      discountAmount: Number(formData.discountAmount) || 0,
      discountPercentage: Number(formData.discountPercentage) || 0,
    };

    if (isEditing) {
      await editDiscount(formData.discountId, formattedData);
      alert('✅ Discount updated successfully!');
    } else {
      await addDiscount(formattedData);
      alert('✅ Discount added successfully!');
    }

    // Refresh list after update/add
    if (typeof fetchDiscounts === 'function') {
      await fetchDiscounts();
    }

    setShowModal(false);
    setFormData({
      discountId: '',
      discountCode: '',
      status: 'Active',
      startDate: '',
      endDate: '',
      discountType: '',
      discountAmount: '',
      discountPercentage: '',
    });
  } catch (err) {
    console.error('Error saving discount:', err);
    alert('❌ Failed to save discount. Please check your input.');
  }
};


  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="discount-list-container">
          <div className="discount-list-header">
            <h2>Discounts</h2>
            <button className="add-discount-btn" onClick={handleAddClick}>
              <i className="fas fa-plus"></i> Add Discount
            </button>
          </div>

          {/* Add/Edit Discount Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{isEditing ? 'Edit Discount' : 'Add New Discount'}</h3>
                <form onSubmit={handleSubmit} className="add-discount-form">
                  <div className="dsform-group">
                    <label htmlFor="discountCode">Discount Code</label>
                    <input
                      type="text"
                      id="discountCode"
                      value={formData.discountCode}
                      onChange={(e) =>
                        setFormData({ ...formData, discountCode: e.target.value })
                      }
                      placeholder="Enter discount code"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="dsform-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="dsform-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="dsform-group">
                    <label htmlFor="discountType">Discount Type</label>
                    <select
                      id="discountType"
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({ ...formData, discountType: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Type</option>
                      {(discountTypes.length ? discountTypes : ['Percentage', 'Fixed']).map(
                        (type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="dsform-group">
                    <label htmlFor="discountAmount">Discount Amount</label>
                    <input
                      type="number"
                      id="discountAmount"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, discountAmount: e.target.value })
                      }
                      placeholder="Enter discount amount"
                    />
                  </div>

                  <div className="dsform-group">
                    <label htmlFor="discountPercentage">Discount Percentage</label>
                    <input
                      type="number"
                      id="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData({ ...formData, discountPercentage: e.target.value })
                      }
                      placeholder="Enter discount percentage"
                    />
                  </div>

                 

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      <i className="fas fa-check"></i>{' '}
                      {isEditing ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowModal(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Discount Table */}
       {loading ? (
  <p>Loading discounts...</p>
) : (
  <div className="discount-table-container">
    <table className="discount-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Discount Code</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Percentage</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {discounts.length === 0 ? (
          <tr>
            <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
              No discounts found.
            </td>
          </tr>
        ) : (
          discounts.map((discount) => (
            <tr key={discount.discountId}>
              <td>{discount.discountId}</td>
              <td>{discount.discountCode}</td>
              <td>{discount.startDate || '-'}</td>
              <td>{discount.endDate || '-'}</td>
              <td>{discount.discountType || '-'}</td>
              <td>{discount.discountAmount || '-'}</td>
              <td>{discount.discountPercentage || '-'}</td>
              <td>
                <span className={`status-badge status-${discount.status}`}>
                  {discount.status}
                </span>
              </td>
              <td>
                <div className="action-buttons-container">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(discount)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(discount)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
