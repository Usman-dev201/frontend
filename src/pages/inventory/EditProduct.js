import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/AddProduct.css';

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, updateProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    sku: '',
    category: '',
    brand: '',
    barcodeType: '',
    quantityThreshold: '',
    description: '',
    date: '',
    image: null,
    discounts: []
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');
  const [selectedDiscountType, setSelectedDiscountType] = useState('');

  // Sample discount codes and types
  const discountCodes = ['SUMMER2024', 'SPECIAL50'];
  const discountTypes = ['percentage', 'fixed'];

  useEffect(() => {
    const product = products.find(p => p.id === parseInt(id));
    if (product) {
      setFormData({
        name: product.name || '',
        shortName: product.shortName || '',
        sku: product.sku || '',
        category: product.category || '',
        brand: product.brand || '',
        barcodeType: product.barcodeType || '',
        quantityThreshold: product.quantityThreshold || '',
        description: product.description || '',
        date: product.date || '',
        image: product.image || null,
        discounts: product.discounts || []
      });
      setImagePreview(product.image);
      setDiscounts(product.discounts || []);
    } else {
      navigate('/product/list');
    }
  }, [id, navigate, products]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDiscountCodeChange = (e) => {
    const code = e.target.value;
    if (code) {
      setSelectedDiscountCode(code);
      if (selectedDiscountType) {
        addNewDiscount(code, selectedDiscountType);
      }
    }
  };

  const handleDiscountTypeChange = (e) => {
    const type = e.target.value;
    if (type) {
      setSelectedDiscountType(type);
      if (selectedDiscountCode) {
        addNewDiscount(selectedDiscountCode, type);
      }
    }
  };

  const addNewDiscount = (code, type) => {
    const newDiscount = {
      code: code,
      discountType: type,
      discountAmount: '',
      discountPercentage: ''
    };

    setDiscounts([...discounts, newDiscount]);
    setSelectedDiscountCode('');
    setSelectedDiscountType('');
  };

  const handleDiscountValueChange = (index, field, value) => {
    const updatedDiscounts = [...discounts];
    updatedDiscounts[index][field] = value;
    setDiscounts(updatedDiscounts);
  };

  const handleRemoveDiscount = (discountToRemove) => {
    setDiscounts(discounts.filter(discount => 
      discount.code !== discountToRemove.code || 
      discount.discountType !== discountToRemove.discountType
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update the product
    updateProduct(parseInt(id), {
      ...formData,
      image: imagePreview,
      discounts: discounts
    });
    
    // Navigate back to product list
    navigate('/product/list');
  };

  return (
    <div className="add-product-page">
      <Topbar />
      <Sidebar />
      <div className="add-product-content">
        <div className="add-product-header">
          <h2>Edit Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-sections-container">
            <div className="product-info-section">
              <div className="product-fields">
                <div className="form-group">
                  <label htmlFor="name">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sku">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    placeholder="Enter SKU"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shortName">Short Name</label>
                  <input
                    type="text"
                    id="shortName"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="Enter short name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantityThreshold">Quantity Alert</label>
                  <input
                    type="number"
                    id="quantityThreshold"
                    name="quantityThreshold"
                    value={formData.quantityThreshold}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="Enter alert quantity"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                    <option value="Books">Books</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Brand</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Brand</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="barcodeType">Barcode Type</label>
                  <select
                    id="barcodeType"
                    name="barcodeType"
                    value={formData.barcodeType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Barcode Type</option>
                    <option value="UPC">UPC</option>
                    <option value="EAN">EAN</option>
                    <option value="Code 128">Code 128</option>
                    <option value="QR Code">QR Code</option>
                  </select>
                </div>

                <div className="form-group image-group">
                  <label htmlFor="image">Product Image</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="image-input"
                    />
                    <span className="image-upload-placeholder">
                      Click or drag image here
                      <small>Supports JPG, PNG up to 5MB</small>
                    </span>
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Product preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="description-section">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows="4"
                />
              </div>
            </div>

            <div className="discount-section">
              <div className="discount-header">
                <h3>Discount Information</h3>
              </div>
              <div className="discount-controls">
                <div className="discount-dropdowns">
                  <select 
                    value={selectedDiscountCode}
                    onChange={handleDiscountCodeChange}
                    className="discount-select"
                  >
                    <option value="">Select Discount Code</option>
                    {discountCodes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>

                  <select 
                    value={selectedDiscountType}
                    onChange={handleDiscountTypeChange}
                    className="discount-select"
                  >
                    <option value="">Select Discount Type</option>
                    {discountTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="discounts-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Discount Code</th>
                      <th>Discount Type</th>
                      <th>Discount Amount</th>
                      <th>Discount Percentage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{discount.code}</td>
                        <td>{discount.discountType}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={discount.discountAmount}
                            onChange={(e) => handleDiscountValueChange(index, 'discountAmount', e.target.value)}
                            placeholder="Enter amount"
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={discount.discountPercentage}
                            onChange={(e) => handleDiscountValueChange(index, 'discountPercentage', e.target.value)}
                            placeholder="Enter %"
                            className="table-input"
                          />
                        </td>
                        <td>
                          <button 
                            type="button"
                            className="delete-button"
                            onClick={() => handleRemoveDiscount(discount)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                <i className="fas fa-save"></i>
                Update Product
              </button>
              <button 
                type="button" 
                className="apply-discount-button"
                onClick={() => navigate('/discounts')}
              >
                <i className="fas fa-tag"></i>
                Apply Discount
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 