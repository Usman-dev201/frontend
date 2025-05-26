import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Discount.css';

const AddDiscount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState({
    code: '',
    status: 'active',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDiscount(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear any previous errors
  };

  const validateForm = () => {
    if (!discount.code.trim()) {
      setError('Discount code is required');
      return false;
    }
    if (discount.type === 'percentage' && (discount.value < 0 || discount.value > 100)) {
      setError('Percentage must be between 0 and 100');
      return false;
    }
    if (discount.startDate && discount.endDate && new Date(discount.startDate) > new Date(discount.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Add your API call here to save the discount
      // const response = await api.saveDiscount(discount);
      console.log('Saving discount:', discount);
      // After successful save, navigate back to discount list
      navigate('/discount');
    } catch (err) {
      setError('Failed to save discount. Please try again.');
      console.error('Error saving discount:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/discount');
  };

  return (
    <div className="discount-list-container">
      <div className="discount-list-header">
        <h2>Add New Discount</h2>
      </div>

      <div className="add-discount-form-container">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="add-discount-form">
          <div className="form-group">
            <label htmlFor="code">Discount Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={discount.code}
              onChange={handleChange}
              className="discount-input"
              placeholder="Enter discount code"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Discount Type</label>
            <select
              id="type"
              name="type"
              value={discount.type}
              onChange={handleChange}
              className="discount-select"
              required
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="value">{discount.type === 'percentage' ? 'Percentage' : 'Amount'}</label>
            <input
              type="number"
              id="value"
              name="value"
              value={discount.value}
              onChange={handleChange}
              className="discount-input"
              placeholder={discount.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              required
              min="0"
              max={discount.type === 'percentage' ? "100" : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={discount.startDate}
              onChange={handleChange}
              className="discount-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={discount.endDate}
              onChange={handleChange}
              className="discount-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="minPurchase">Minimum Purchase Amount</label>
            <input
              type="number"
              id="minPurchase"
              name="minPurchase"
              value={discount.minPurchase}
              onChange={handleChange}
              className="discount-input"
              placeholder="Enter minimum purchase amount"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxDiscount">Maximum Discount Amount</label>
            <input
              type="number"
              id="maxDiscount"
              name="maxDiscount"
              value={discount.maxDiscount}
              onChange={handleChange}
              className="discount-input"
              placeholder="Enter maximum discount amount"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="usageLimit">Usage Limit</label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              value={discount.usageLimit}
              onChange={handleChange}
              className="discount-input"
              placeholder="Enter usage limit"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Discount Status</label>
            <select
              id="status"
              name="status"
              value={discount.status}
              onChange={handleChange}
              className="discount-select"
              required
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div className="form-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Discount'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiscount; 