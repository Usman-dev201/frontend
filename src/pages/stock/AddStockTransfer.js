import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './StockTransfer.css';

export default function AddStockTransfer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([
    {
      id: 'P001',
      name: 'Product 1',
      quantity: 0,
      unitPrice: 0,
      totalAmount: 0
    },
    {
      id: 'P002',
      name: 'Product 2',
      quantity: 0,
      unitPrice: 0,
      totalAmount: 0
    }
  ]);

  const [newTransfer, setNewTransfer] = useState({
    date: '',
    fromLocation: '',
    toLocation: '',
    status: 'pending',
    shippingCharges: '',
    additionalNotes: ''
  });

  const handleAddTransfer = (e) => {
    e.preventDefault();
    if (newTransfer.fromLocation && newTransfer.toLocation) {
      // Here you would typically make an API call to save the transfer
      // For now, we'll just navigate back to the list
      navigate('/stock/transfer');
    }
  };

  const handleDeleteProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
  };

  const handleQuantityChange = (productId, value) => {
    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === productId) {
        const newQuantity = parseInt(value) || 0;
        return {
          ...product,
          quantity: newQuantity,
          totalAmount: newQuantity * product.unitPrice
        };
      }
      return product;
    }));
  };

  const handleUnitPriceChange = (productId, value) => {
    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === productId) {
        const newUnitPrice = parseFloat(value) || 0;
        return {
          ...product,
          unitPrice: newUnitPrice,
          totalAmount: product.quantity * newUnitPrice
        };
      }
      return product;
    }));
  };

  const filteredProducts = selectedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="stock-transfer-page">
      <Topbar />
      <Sidebar />
      <div className="stock-transfer-container">
        <div className="stock-transfer-header">
          <h2>Add Stock Transfer</h2>
          <button 
            className="cancel-btn"
            onClick={() => navigate('/stock/transfer')}
          >
            <i className="fas fa-arrow-left"></i>
            Back to List
          </button>
        </div>

        <div className="add-transfer-form-container">
          <form onSubmit={handleAddTransfer} className="add-transfer-form">
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={newTransfer.date}
                  onChange={(e) => setNewTransfer({ ...newTransfer, date: e.target.value })}
                  className="transfer-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="fromLocation">From Location</label>
                <input
                  type="text"
                  id="fromLocation"
                  value={newTransfer.fromLocation}
                  onChange={(e) => setNewTransfer({ ...newTransfer, fromLocation: e.target.value })}
                  placeholder="Enter source location"
                  className="transfer-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="toLocation">To Location</label>
                <input
                  type="text"
                  id="toLocation"
                  value={newTransfer.toLocation}
                  onChange={(e) => setNewTransfer({ ...newTransfer, toLocation: e.target.value })}
                  placeholder="Enter destination location"
                  className="transfer-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={newTransfer.status}
                  onChange={(e) => setNewTransfer({ ...newTransfer, status: e.target.value })}
                  className="transfer-select"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="shippingCharges">Shipping Charges</label>
                <input
                  type="number"
                  id="shippingCharges"
                  value={newTransfer.shippingCharges}
                  onChange={(e) => setNewTransfer({ ...newTransfer, shippingCharges: e.target.value })}
                  placeholder="Enter shipping charges"
                  className="transfer-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="additionalNotes">Additional Notes</label>
                <textarea
                  id="additionalNotes"
                  value={newTransfer.additionalNotes}
                  onChange={(e) => setNewTransfer({ ...newTransfer, additionalNotes: e.target.value })}
                  placeholder="Enter additional notes"
                  className="transfer-textarea"
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                <i className="fas fa-check"></i> Save Transfer
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/stock/transfer')}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Product Search and List Section */}
        <div className="product-section">
          <div className="search-bar-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search products by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="product-list-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="quantity-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) => handleUnitPriceChange(product.id, e.target.value)}
                        className="price-input"
                      />
                    </td>
                    <td>₹{product.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="add-details-button-container">
            <button className="add-details-btn">
              <i className="fas fa-plus"></i> Add Transfer Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 