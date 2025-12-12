import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { useBarcode } from '../../context/BarcodeContext';
import { useBrands } from '../../context/BrandContext'; 
import { uploadImage } from '../../context/ProductContext';
import '../../styles/AddProduct.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const { 
    addProduct,  
    loading, 
    setLoading, 
    discountCodes,
    fetchProducts,
    getProductDiscounts,
    addProductDiscount
  } = useProducts();
  
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { barcodes } = useBarcode(); 
  
  const [imagePreview, setImagePreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');
  const [currentProductId, setCurrentProductId] = useState(null);

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
      addNewDiscount(code);
    }
  };

  const addNewDiscount = (code) => {
    const newDiscount = {
      code: code
    };
    
    setDiscounts(prev => {
      if (prev.some(d => d.code === code)) return prev;
      return [...prev, newDiscount];
    });

    setSelectedDiscountCode('');
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
    const imageFile = formData.get('image');
    let uploadedImageUrl = '';
    
    const selectedCategoryId = parseInt(formData.get('categoryId'));
    const selectedBrandId = parseInt(formData.get('brandId'));
    const selectedBarcodeId = parseInt(formData.get('barcodeId'));

    const selectedCategory = categories.find(c => c.categoryId === selectedCategoryId);
    const selectedBrand = brands.find(b => b.brandId === selectedBrandId);
    const selectedBarcode = barcodes.find(b => b.barcodeId === selectedBarcodeId);
    
    if (imageFile && imageFile.size > 0) {
      try {
        uploadedImageUrl = await uploadImage(imageFile);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        alert('Image upload failed. Please try again.');
        setLoading(false);
        return;
      }
    }

    const newProduct = {
      date: formData.get('date') || new Date().toISOString().split('T')[0],
      imageUrl: uploadedImageUrl,
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
      setLoading(true);
      const addedProduct = await addProduct(newProduct);

      const confirmDiscount = window.confirm(
        "Product added successfully! Do you also want to add discounts to this product?"
      );

      if (confirmDiscount) {
        setCurrentProductId(addedProduct.productId);
        alert("Now you can add discounts using the Apply Discount button.");
      } else {
        navigate('/product/list');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-page">
        <Topbar />
        <Sidebar />
        <div className="product-content">
          <div className="loading-container">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <Topbar />
      <Sidebar />
      <div className="product-content">
        <div className="product-container">
          <div className="product-header">
            <h2>Add New Product</h2>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            {/* Product Information Box */}
            <div className="product-box">
              <h3>Product Information</h3>
              <div className="details-grid">
                <div className="productform-group">
                  <label htmlFor="productName">Product Name</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    required
                    placeholder="Enter product name"
                    className="form-input"
                  />
                </div>

                <div className="productform-group">
                  <label htmlFor="sku">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    required
                    placeholder="Enter SKU"
                    className="form-input"
                  />
                </div>

                <div className="productform-group">
                  <label htmlFor="shortName">Short Name</label>
                  <input
                    type="text"
                    id="shortName"
                    name="shortName"
                    placeholder="Enter short name"
                    className="form-input"
                  />
                </div>

                <div className="productform-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="form-input"
                  />
                </div>

                <div className="productform-group">
                  <label htmlFor="quantityThreshold">Quantity Alert</label>
                  <input
                    type="number"
                    id="quantityThreshold"
                    name="quantityThreshold"
                    min="0"
                    required
                    placeholder="Enter alert quantity"
                    className="form-input"
                  />
                </div>

                <div className="productform-group">
                  <label htmlFor="categoryId">Category</label>
                  <select 
                    id="categoryId" 
                    name="categoryId" 
                    required
                    className="productform-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="productform-group">
                  <label htmlFor="brandId">Brand</label>
                  <select 
                    id="brandId" 
                    name="brandId" 
                    required
                    className="productform-select"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.brandName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="productform-group">
                  <label htmlFor="barcodeId">Barcode Type</label>
                  <select 
                    id="barcodeId" 
                    name="barcodeId" 
                    required
                    className="productform-select"
                  >
                    <option value="">Select Barcode Type</option>
                    {barcodes.map(barcode => (
                      <option key={barcode.barcodeId} value={barcode.barcodeId}>
                        {barcode.barcodeType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="productform-group">
                  <label htmlFor="image" className="form-label">Product Image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="productform-input"
                  />
                  <small className="productform-text text-muted">
                    Max File size: 5MB<br />
                    Aspect ratio should be 1:1
                  </small>

                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Product preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Box */}
            <div className="product-box">
              <h3>Product Description</h3>
              <div className="productform-group">
                <textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Enter product description"
                  rows="4"
                  className="productform-textarea"
                />
              </div>
            </div>

            {/* Discount Information Box */}
            <div className="product-box">
              <h3>Discount Information</h3>
              <div className="discount-controls">
                <div className="productform-group">
                  <label htmlFor="discountCode">Select Discount Code</label>
                  <select 
                    value={selectedDiscountCode}
                    onChange={handleDiscountCodeChange}
                    className="productform-select"
                    id="discountCode"
                  >
                    <option value="">Select Discount Code</option>
                    {discountCodes.map((discount, idx) => {
                      const label = discount.discountPercentage
                        ? `${discount.discountCode} (${discount.status} - ${discount.discountPercentage}%)`
                        : `${discount.discountCode} (${discount.status} - Rs.${discount.discountAmount})`;
                      
                      return (
                        <option key={idx} value={discount.discountCode}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="discounts-table-container">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Discount Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount, index) => (
                      <tr key={index}>
                        <td>{discount.code}</td>
                        <td>
                          <button 
                            type="button"
                            className="delete-btn"
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

            {/* Action Buttons */}
            <div className="product-actions">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-plus"></i>
                Add Product
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={async () => {
                  if (!currentProductId) {
                    alert("Please add a product first before applying discounts.");
                    return;
                  }
                  try {
                    await addProductDiscount(currentProductId, discounts);
                    const savedDiscounts = await getProductDiscounts(currentProductId);
                    setDiscounts(savedDiscounts);
                    setCurrentProductId(null);
                    await fetchProducts();
                    alert("Discounts applied successfully!");
                    navigate('/product/list');
                  } catch (error) {
                    alert("Failed to apply discounts. Please try again.");
                  }
                }}
              >
                <i className="fas fa-tag"></i>
                Apply Discount
              </button>
              
              <button 
                type="button" 
                className="btn btn-cancel"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}