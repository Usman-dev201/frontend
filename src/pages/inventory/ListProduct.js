import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
// import { useProducts } from '../../context/ProductContext';
import '../../styles/ListProduct.css';

export default function ListProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    // Load products from localStorage when component mounts
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts);
  }, []);

  // Format price function to handle currency formatting
  const formatPrice = (price) => {
    if (!price) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'PKR',
    }).format(price);
  };

  // Handle edit function
  const handleEdit = (product) => {
    navigate(`/product/edit/${product.id}`, { state: { product } });
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
    setShowDropdown(null);
  };

  const toggleDropdown = (productId) => {
    setShowDropdown(showDropdown === productId ? null : productId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown')) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="list-product-page">
      <Topbar />
      <Sidebar />
      <div className="list-product-content">
        <div className="list-product-header">
          <div className="header-title">
            <h2>Product List</h2>
            <button 
              className="action-button stock-button"
              onClick={() => navigate('/stock/list')}
            >
              <i className="fas fa-boxes"></i>
              Stock List
            </button>
          </div>
          <div className="header-actions">
            <button 
              className="action-button add-button"
              onClick={() => navigate('/product/add')}
            >
              <i className="fas fa-plus"></i>
              Add Product
            </button>
          </div>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Short Name</th>
                <th>Location</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Purchase Price</th>
                <th>Marked Price</th>
                <th>Selling Price</th>
                <th>Discount Code</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Barcode Type</th>
                <th>Quantity Alert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.date || new Date().toLocaleDateString()}</td>
                  <td>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="product-image"
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.shortName || '-'}</td>
                  <td>{product.location}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className={`stock-badge ${product.quantity <= 0 ? 'out-of-stock' : product.quantity <= product.quantityThreshold ? 'low-stock' : 'in-stock'}`}>
                      {product.quantity || 0}
                    </span>
                  </td>
                  <td>{formatPrice(product.purchasePrice)}</td>
                  <td>{formatPrice(product.markedPrice)}</td>
                  <td>{formatPrice(product.sellingPrice)}</td>
                  <td>
                    {product.discounts && product.discounts.length > 0 ? (
                      <span className="discount-badge">
                        {product.discounts[0].code}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <span className="barcode-type-badge">
                      {product.barcodeType || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`alert-badge ${product.quantity <= product.quantityThreshold ? 'alert' : ''}`}>
                      {product.quantityThreshold}
                    </span>
                  </td>
                  <td>
                    <div className="action-dropdown">
                      <button 
                        className="action-button dropdown-toggle"
                        onClick={() => toggleDropdown(product.id)}
                      >
                        Actions <i className="fas fa-chevron-down"></i>
                      </button>
                      {showDropdown === product.id && (
                        <div className="dropdown-menu">
                          <button 
                            className="edit-button"
                            onClick={() => handleEdit(product)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDelete(product.id)}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </div>
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