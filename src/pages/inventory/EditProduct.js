import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { useBarcode } from '../../context/BarcodeContext';
import { useBrands } from '../../context/BrandContext';
import '../../styles/AddProduct.css';
import { uploadImage } from '../../context/ProductContext';

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const { updateProduct, loading, setLoading } = useProducts();
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { barcodes } = useBarcode();
const { discountCodes, discountTypes, addProductDiscount, getProductDiscounts, deleteProductDiscount } = useProducts();
const [formData, setFormData] = useState({
  productName: '',
  shortName: '',
  sku: '',
  categoryId: '',
  brandId: '',
  barcodeId: '',
  quantityAlert: '', 
  productDescription: '',
  date: new Date().toISOString().split('T')[0], // Default to today
  imageUrl: null,
 
});
   const [imagePreview, setImagePreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');
  const [selectedDiscountType, setSelectedDiscountType] = useState('');



useEffect(() => {
  if (state?.product) {
    const { product } = state;
    setFormData({
      productName: product.productName || '',
      shortName: product.shortName || '',
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      barcodeId: product.barcodeId || '',
      quantityAlert: product.quantityAlert || '', // Handle both cases
      productDescription: product.productDescription || '',
      date: product.date || new Date().toISOString().split('T')[0],
       imageUrl: product.imageUrl || null,   // ✅ correct key
   
    });
     setImagePreview(
      product.imageUrl ? `https://localhost:7020${product.imageUrl}` : null
    );
   
  }
}, [state]);
useEffect(() => {
  const fetchDiscounts = async () => {
    if (state?.product?.productId) {
      const discountsData = await getProductDiscounts(state.product.productId);
      setDiscounts(discountsData);
    }
  };

  fetchDiscounts();
}, [state, getProductDiscounts]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const uploadedUrl = await uploadImage(file); // returns /images/xxx.jpg
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadedUrl
      }));
      setImagePreview(`https://localhost:7020${uploadedUrl}`); // preview
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image.");
    }
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
const addNewDiscount = async (code, type) => {
  try {
    if (!state?.product?.productId) {
      alert("Invalid product ID.");
      return;
    }

    // 1. Get selected discount from dropdown
    const selectedDiscount = discountCodes.find(dc => dc.discountCode === code);
    if (!selectedDiscount) {
      alert("Invalid discount code.");
      return;
    }

    // 2. Fetch already applied discounts from backend
    const existingDiscounts = await getProductDiscounts(state.product.productId);

    // 3. Check if this discount already exists (by code + type)
    const alreadyExists = existingDiscounts.some(
      d => d.code === code 
    );

    if (alreadyExists) {
      alert("This discount is already applied to the product.");
      return;
    }

    // 4. If not exists → Add to local state
    const newDiscount = {
      discountId: selectedDiscount.discountId,
      code: code,
      discountType: type,
      discountAmount: 0,
      discountPercentage: 0
    };

    setDiscounts(prev => [...prev, newDiscount]);

    // Reset selects
    setSelectedDiscountCode('');
    setSelectedDiscountType('');
  } catch (error) {
    console.error("Error adding new discount:", error);
    alert("Failed to check existing discounts.");
  }
};

  const handleDiscountValueChange = (index, field, value) => {
    const updatedDiscounts = [...discounts];
    updatedDiscounts[index][field] = value;
    setDiscounts(updatedDiscounts);
  };

  const handleRemoveDiscount = async (discountToRemove) => {
  try {
    console.log("Trying to delete:", discountToRemove);

    if (!discountToRemove.productDiscountId) {
      console.log("No productDiscountId → removing locally only");
      setDiscounts(prev =>
        prev.filter(d =>
          d.code !== discountToRemove.code || d.discountType !== discountToRemove.discountType
        )
      );
      return;
    }

    console.log("Deleting from backend with id:", discountToRemove.productDiscountId);
    await deleteProductDiscount(discountToRemove.productDiscountId);

    setDiscounts(prev =>
      prev.filter(d => d.productDiscountId !== discountToRemove.productDiscountId)
    );

    alert("Discount removed successfully!");
  } catch (error) {
    console.error("Delete discount error:", error.response?.data || error.message);
    alert("Failed to delete discount. Please try again.");
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    
    const selectedCategory = categories.find(c => c.categoryId === parseInt(formData.categoryId));
    const selectedBrand = brands.find(b => b.brandId === parseInt(formData.brandId));
    const selectedBarcode = barcodes.find(b => b.barcodeId === parseInt(formData.barcodeId));

    const updatedProduct = {
      productName: formData.productName,
      shortName: formData.shortName,
      sku: formData.sku,
      productDescription: formData.productDescription,
      date: formData.date,
      quantityAlert: Number(formData.quantityAlert),
      imageUrl: formData.imageUrl, 
      categoryId: parseInt(formData.categoryId),
      brandId: parseInt(formData.brandId),
      barcodeId: parseInt(formData.barcodeId),
      category: selectedCategory ? { 
        categoryId: selectedCategory.categoryId,
        categoryName: selectedCategory.categoryName 
      } : null,
      brand: selectedBrand ? { 
        brandId: selectedBrand.brandId,
        brandName: selectedBrand.brandName 
      } : null,
      barcode: selectedBarcode ? { 
        barcodeId: selectedBarcode.barcodeId,
        barcodeType: selectedBarcode.barcodeType 
      } : null,
     
    };

    console.log('Submitting:', updatedProduct);
    
    await updateProduct(id, updatedProduct);
  
    
    // Wait briefly to ensure state updates propagate
    await new Promise(resolve => setTimeout(resolve, 50));
    navigate('/product/list');
  } catch (error) {
    console.error('Update error:', error);
    console.error('Error response:', error.response?.data);
    alert(`Update failed: ${error.response?.data?.message || error.message}`);
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
        name="productName"
        value={formData.productName}
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
  <label htmlFor="quantityAlert">Quantity Alert</label>
  <input
    type="number"
    id="quantityAlert"  
    name="quantityAlert"  
    value={formData.quantityAlert}  
    onChange={handleChange}
    min="0"
    required
    placeholder="Enter alert quantity"
  />
</div>

              <div className="form-group">
  <label htmlFor="categoryId">Category</label>
  <select
    id="categoryId"
    name="categoryId"
    value={formData.categoryId}
    onChange={handleChange}
    required
  >
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
  <select
    id="brandId"
    name="brandId"
    value={formData.brandId}
    onChange={handleChange}
    required
  >
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
  <select
    id="barcodeId"
    name="barcodeId"
    value={formData.barcodeId}
    onChange={handleChange}
    required
  >
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
                </div>
              </div>
            </div>

            <div className="description-section">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
  id="productDescription"
  name="productDescription"
  value={formData.productDescription}
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
  {discountCodes.map(dc => (
    <option key={dc.discountId} value={dc.discountCode}>
      {dc.discountCode}
    </option>
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
      {type}
    </option>
  ))}
</select>
                </div>
              </div>

              <div className="discounts-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                    
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
  onClick={async () => {
    try {
      if (!state?.product?.productId) {
        alert("Invalid product ID.");
        return;
      }
      await addProductDiscount(state.product.productId, discounts);
          // 🔑 refresh from backend so each discount has productDiscountId
      const savedDiscounts = await getProductDiscounts(state.product.productId);
      setDiscounts(savedDiscounts);
      alert("Discounts applied successfully!");
      navigate('/product/list');
    } catch (error) {
      console.error("Apply discount error:", error);
      alert("Failed to apply discounts. Please try again.");
    }
  }}
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
          
        </form>
      </div>
    </div>
  );
} 