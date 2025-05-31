import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { useBarcode } from '../../context/BarcodeContext';
import { useBrands } from '../../context/BrandContext'; 
import '../../styles/AddProduct.css';


export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct,  loading , setLoading} = useProducts();
    const { categories } = useCategories()
    const { brands} = useBrands();
     const { barcodes } = useBarcode(); 
  const [imagePreview, setImagePreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');
  const [selectedDiscountType, setSelectedDiscountType] = useState('');

  // Sample discount codes and types (keep as is)
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

   const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
  const selectedCategoryId = parseInt(formData.get('categoryId'));
  const selectedBrandId = parseInt(formData.get('brandId'));
  const selectedBarcodeId = parseInt(formData.get('barcodeId'));

  const selectedCategory = categories.find(c => c.categoryId === selectedCategoryId);
  const selectedBrand = brands.find(b => b.brandId === selectedBrandId);
  const selectedBarcode = barcodes.find(b => b.barcodeId === selectedBarcodeId);

  const newProduct = {
    date: formData.get('date') || new Date().toISOString().split('T')[0],
    imageData: imagePreview || '',
    productName: formData.get('productName'),
    productDescription: formData.get('description'),
    sku: formData.get('sku'),
    shortName: formData.get('shortName'),
    categoryId: selectedCategoryId,
    category: { categoryName: selectedCategory?.categoryName || '' },
    brandId: selectedBrandId,
    brand: { brandName: selectedBrand?.brandName || '' },
    barcodeId: selectedBarcodeId,
    barcode: { barcodeType: selectedBarcode?.barcodeType || '' },
    quantityAlert: parseInt(formData.get('quantityThreshold')),
  
  };
     try {
        // Show loading state if you have one
        setLoading(true);
        
        await addProduct(newProduct);
        
        // Optional: Show success notification
        alert('Product added successfully!');
        
        // Navigate to product list
        navigate('/product/list');
    } catch (error) {
        console.error('Failed to add product:', error);
        
        // Show error message
        alert('Failed to add product. Please try again.');
        
        // Optionally: Handle specific error cases
        if (error.response) {
            if (error.response.status === 400) {
                alert('Validation error: ' + error.response.data);
            } else if (error.response.status === 500) {
                alert('Server error. Please try again later.');
            }
        }
    } finally {
        setLoading(false);
    }
};

  if (loading) {
    return <div>Loading...</div>;
  }


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
  <label htmlFor="categoryId">Category</label>
  <select id="categoryId" name="categoryId" required>
    <option value="">Select Category</option>
    {categories.map(category => (
      <option key={category.categoryId} value={category.categoryId}>
        {category.categoryName}
      </option>
    ))}
  </select>
</div>

                <div className="form-group">
                  <label htmlFor="brandId">Brand</label>
                  <select id="brandId" name="brandId" required>
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.brandName}
                      </option>
                    ))}
                  </select>
                </div>

           <div className="form-group">
  <label htmlFor="barcodeId">Barcode Type</label>
  <select id="barcodeId" name="barcodeId" required>
    <option value="">Select Barcode Type</option>
    {barcodes.map(barcode => (
      <option key={barcode.barcodeId} value={barcode.barcodeId}>
        {barcode.barcodeType}
      </option>
    ))}
  </select>
</div>
           
<div className="form-group">
  <label htmlFor="image" className="form-label">Product image:</label>
  <input
    type="file"
    id="image"
    name="image"
    accept="image/*"
    onChange={handleImageChange}
    className="simple-image-input"
  />
  <small className="form-text text-muted">
    Max File size: 5MB<br />
    Aspect ratio should be 1:1
  </small>

  {imagePreview && (
    <div className="image-preview">
      <img src={imagePreview} alt="Product preview" />
    </div>
  )}
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
            </div>
            </div> 
        </form>
        
        </div>
      </div>
  
    
  );
} 