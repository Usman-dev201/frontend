import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/AddProduct.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const [imagePreview, setImagePreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');
  const [selectedDiscountType, setSelectedDiscountType] = useState('');

  // Sample discount codes and types
  const discountCodes = ['SUMMER2024', 'SPECIAL50'];
  const discountTypes = ['percentage', 'fixed'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
    const formData = new FormData(e.target);
    
    // Create new product with corrected field names
    const newProduct = {
      id: Date.now(),
      name: formData.get('productName'),
      shortName: formData.get('shortName'),
      sku: formData.get('sku'),
      description: formData.get('description'),
      category: formData.get('category'),
      brand: formData.get('brand'),
      quantityThreshold: Number(formData.get('quantityThreshold')),
      image: imagePreview || 'https://via.placeholder.com/150',
      location: 'Main Warehouse',
      purchasePrice: 0,
      markedPrice: 0,
      sellingPrice: 0,
      discounts: discounts,
      date: formData.get('date') || new Date().toISOString().split('T')[0],
      status: 'active',
      categoryId: formData.get('category'),
      brandId: formData.get('brand'),
      quantity: 0
    };

    // Add to context
    addProduct(newProduct);
    navigate('/product/list');
  };

  return (
    <div className="add-product-page">
      <Topbar />
      <Sidebar />
      <div className="add-product-content">
        <div className="add-product-header">
          <h2>Add New Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-sections-container">
            <div className="product-info-section">
              <div className="product-fields">
                <div className="form-group">
                  <label htmlFor="productName">Product Name</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
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
                    placeholder="Enter short name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantityThreshold">Quantity Alert</label>
                  <input
                    type="number"
                    id="quantityThreshold"
                    name="quantityThreshold"
                    min="0"
                    required
                    placeholder="Enter alert quantity"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" required>
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
                  <select id="brand" name="brand" required>
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
                  <select id="barcodeType" name="barcodeType" required>
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
                      accept="image/*"
                      onChange={handleImageChange}
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
                  required
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
                <i className="fas fa-plus"></i>
                Add Product
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