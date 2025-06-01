import React from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/StockList.css';

export default function StockList() {
  const navigate = useNavigate();
  const { products } = useProducts();

  // Format price function to handle currency formatting
  const formatPrice = (price) => {
    if (!price) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Calculate current stock value
  const calculateStockValue = (price, quantity) => {
    return price * (quantity || 0);
  };

  // Calculate potential profit
  const calculatePotentialProfit = (sellingPrice, purchasePrice, quantity) => {
    return (sellingPrice - purchasePrice) * (quantity || 0);
  };

  return (
    <div className="stock-list-page">
      <Topbar />
      <Sidebar />
      <div className="stock-list-content">
        <div className="stock-list-header">
          <div className="header-title">
            <h2>Stock List</h2>
            <button 
              className="action-button list-product-button"
              onClick={() => navigate('/product/list')}
            >
              <i className="fas fa-list"></i>
              Product List
            </button>
          </div>
        </div>

        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Short Name</th>
                <th>Location</th>
                <th>Purchase Price</th>
                <th>Marked Price</th>
                <th>Selling Price</th>
                 <th>Current Stock</th>
                <th>Current Stock Value (Purchase)</th>
                <th>Current Stock Value (Selling)</th>
                <th>Potential Profit</th>
                <th>Total Units Sold</th>
                <th>Total Units Transferred</th>
                <th>Total Units Adjusted</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.shortName}</td>
                  <td>{product.location}</td>
                  <td>{formatPrice(product.purchasePrice)}</td>
                  <td>{formatPrice(product.markedPrice)}</td>
                  <td>{formatPrice(product.sellingPrice)}</td>
                  <td>{product.quantity}</td> 
                  <td>{formatPrice(calculateStockValue(product.purchasePrice, product.quantity))}</td>
                  <td>{formatPrice(calculateStockValue(product.sellingPrice, product.quantity))}</td>
                  <td>{formatPrice(calculatePotentialProfit(product.sellingPrice, product.purchasePrice, product.quantity))}</td>
                  <td>{product.unitsSold || 0}</td>
                  <td>{product.unitsTransferred || 0}</td>
                  <td>{product.unitsAdjusted || 0}</td>
                  <td>
                    <span className={`stock-status ${product.quantity <= product.quantityAlert ? 'low-stock' : 'in-stock'}`}>
                      <i className={`fas ${product.quantity <= product.quantityAlert ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
                      {product.quantity <= product.quantityAlert ? 'Low Stock' : 'In Stock'}
                    </span>
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