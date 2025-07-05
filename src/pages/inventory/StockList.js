import React from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/StockList.css';

export default function StockList() {
  const navigate = useNavigate();
 const { stocks = [], loading, error } = useProducts();
  // Format price function to handle currency formatting
  const formatPrice = (price) => {
    if (!price) return 'Rs0.00';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(price);
  };
 if (loading) return <div>Loading stock data...</div>;
  if (error) return <div>Error loading stock data: {error.message}</div>;


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
               {stocks.map((stock) => (
                <tr key={`${stock.productId}-${stock.locationId}`}>
                  <td>{stock.stockId}</td>
                  <td>{stock.product?.productName}</td>
                  <td>{stock.location?.locationName}</td>
                  <td>{formatPrice(stock.purchasePrice)}</td>
                  <td>{formatPrice(stock.markedPrice)}</td>
                  <td>{formatPrice(stock.sellingPrice)}</td>
                  <td>{stock.currentStock}</td>
                  <td>{formatPrice(stock.currentStockValueByPurPrice)}</td>
                  <td>{formatPrice(stock.currentStockValueBySelPrice)}</td>
                  <td>{formatPrice(stock.potentialProfit)}</td>
                  <td>{stock.totalUnitSold || 0}</td>
                  <td>{stock.totalUnitTransfered || 0}</td>
                  <td>{stock.totalUnitAdjust || 0}</td>
                  <td>
                    <span className={`stock-status ${stock.status === 'LowStock' ? 'low-stock' : 'in-stock'}`}>
                      {stock.status}
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