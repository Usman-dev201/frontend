import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/ListProduct.css';

export default function ListProduct() {
    const navigate = useNavigate();
  const { products, stocks = [], deleteProduct, loading ,getProductDiscounts} = useProducts();
   
const [productDiscountsMap, setProductDiscountsMap] = useState({});

useEffect(() => {
  if (products.length === 0) return;

  const fetchDiscounts = async () => {
    const discountsMap = {};

    for (const product of products) {
      const discounts = await getProductDiscounts(product.productId);

      // remove duplicate discount codes
      const uniqueDiscounts = discounts.filter(
        (d, index, self) => self.findIndex(x => x.code === d.code) === index
      );

      discountsMap[product.productId] = uniqueDiscounts;
    }

    setProductDiscountsMap(discountsMap); // ✅ one update
  };

  fetchDiscounts();
}, [products, getProductDiscounts]);



   const maxDiscountCount = Math.max(
  ...Object.values(productDiscountsMap).map(d => d.length),
  0
);




  // Format price to PKR
  const formatPrice = (price) => {
    if (!price) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'PKR',
    }).format(price);
  };

  // Navigate to Edit page
  const handleEdit = (product) => {
    navigate(`/product/Edit/${product.productId}`, { state: { product } });
  };

  // Delete product
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Get stock info for product
  const getStockByProductId = (productId) => {
    return stocks.find((stock) => stock.productId === productId);
  };

  if (loading) {
    return (
      <div className="list-product-page">
        <Topbar />
        <Sidebar />
        <div className="list-product-content">
          <div className="loading-spinner">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="list-product-page">
      <Topbar />
      <Sidebar />
      <div className="list-product-content">
        {/* Header */}
        <div className="list-product-header">
          <div className="header-title">
            <h2>Product List</h2>
            <button
              className="action-button stock-button"
              onClick={() => navigate('/stock/list')}
            >
              <i className="fas fa-boxes"></i> Stock List
            </button>
             
          </div>
          <div className="header-actions">
            <button
              className="action-button add-button"
              onClick={() => navigate('/product/add')}
            >
              <i className="fas fa-plus"></i> Add Product
            </button>
          </div>
        </div>

        {/* Product Table */}
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
                    {/* Dynamic Discount Code Columns */}
  {Array.from({ length: maxDiscountCount }, (_, i) => (
  <th key={`discount-header-${i}`}>Discount {i + 1}</th>
))}
                <th>Category</th>
                <th>Brand</th>
                <th>Barcode Type</th>
                <th>Quantity Alert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = getStockByProductId(product.productId);
                return (
                  <tr key={product.productId}>
                    <td>{product.productId}</td>
                    <td>{product.date || new Date().toLocaleDateString()}</td>
                   <td>
  {product.imageUrl ? (
    <img
      src={`https://localhost:7020${product.imageUrl}`}   // ✅ prepend backend URL
      alt={product.productName}
      className="product-image"
    />
  ) : (
    <div className="no-image">No Image</div>
  )}
</td>
                    <td>{product.productName}</td>
                    <td>{product.shortName || '-'}</td>
                    <td>{stock?.location?.locationName || 'N/A'}</td>
                    <td>{product.sku}</td>
                    <td>
                      <span
                        className={`stock-badge ${
                          stock?.currentStock <= 0
                            ? 'out-of-stock'
                            : stock?.currentStock <= product.quantityThreshold
                            ? 'low-stock'
                            : 'in-stock'
                        }`}
                      >
                        {stock?.currentStock ?? 0}
                      </span>
                    </td>
                    <td>{formatPrice(stock?.purchasePrice)}</td>
                    <td>{formatPrice(stock?.markedPrice)}</td>
                    <td>{formatPrice(stock?.sellingPrice)}</td>

                   {/* Dynamic Discount Code Cells */}
   {/* Dynamic Discount Code Cells */}
{Array.from({ length: maxDiscountCount }, (_, i) => {
  const discounts = productDiscountsMap[product?.productId] || [];
  return (
    <td key={`discount-${i}`}>
      {discounts[i] ? (
        <span className="discount-badge">{discounts[i].code}</span>
      ) : (
        'N/A'
      )}
    </td>
  );
})}



                    <td>{product.category?.categoryName}</td>
                    <td>{product.brand?.brandName}</td>
                    <td>
                      <span className="barcode-type-badge">
                        {product.barcode?.barcodeType || 'N/A'}
                      </span>
                    </td>

                 
                 

                    <td>
                      <span
                        className={`alert-badge ${
                          stock?.currentStock <= product.quantityAlert
                            ? 'alert'
                            : ''
                        }`}
                      >
                        {product.quantityAlert}
                      </span>
                    </td>
                    <td>
                      {/* Direct action buttons */}
                      <button
                        className="edit-button action-btn"
                        onClick={() => handleEdit(product)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        className="delete-button action-btn"
                        onClick={() => handleDelete(product.productId)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
