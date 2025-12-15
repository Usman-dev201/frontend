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
  const { discountCodes, addProductDiscount, getProductDiscounts, fetchProducts, deleteProductDiscount } = useProducts();

  const [formData, setFormData] = useState({
    productName: '',
    shortName: '',
    sku: '',
    categoryId: '',
    brandId: '',
    barcodeId: '',
    quantityAlert: '',
    productDescription: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');

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
        quantityAlert: product.quantityAlert || '',
        productDescription: product.productDescription || '',
        date: product.date || new Date().toISOString().split('T')[0],
        imageUrl: product.imageUrl || null,
      });
      setImagePreview(product.imageUrl ? `https://9v75jts3-7020.asse.devtunnels.ms${product.imageUrl}` : null);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const uploadedUrl = await uploadImage(file);
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
        setImagePreview(`https://9v75jts3-7020.asse.devtunnels.ms${uploadedUrl}`);
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
      addNewDiscount(code);
    }
  };

  const addNewDiscount = async (code) => {
    try {
      if (!state?.product?.productId) return alert("Invalid product ID.");

      const selectedDiscount = discountCodes.find(dc => dc.discountCode === code);
      if (!selectedDiscount) return alert("Invalid discount code.");

      if (discounts.some(d => d.code === code)) return alert("This discount is already added.");

      setDiscounts(prev => [...prev, { discountId: selectedDiscount.discountId, code: selectedDiscount.discountCode }]);
      setSelectedDiscountCode('');
    } catch (error) {
      console.error("Error adding discount:", error);
      alert("Failed to add discount.");
    }
  };

  const handleRemoveDiscount = async (discountToRemove) => {
    try {
      if (!discountToRemove.productDiscountId) {
        setDiscounts(prev => prev.filter(d => d.code !== discountToRemove.code));
        return;
      }
      await deleteProductDiscount(discountToRemove.productDiscountId);
      setDiscounts(prev => prev.filter(d => d.productDiscountId !== discountToRemove.productDiscountId));
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
        ...formData,
        quantityAlert: Number(formData.quantityAlert),
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        barcodeId: parseInt(formData.barcodeId),
        category: selectedCategory ? { categoryId: selectedCategory.categoryId, categoryName: selectedCategory.categoryName } : null,
        brand: selectedBrand ? { brandId: selectedBrand.brandId, brandName: selectedBrand.brandName } : null,
        barcode: selectedBarcode ? { barcodeId: selectedBarcode.barcodeId, barcodeType: selectedBarcode.barcodeType } : null,
      };

      await updateProduct(id, updatedProduct);
      navigate('/product/list');
    } catch (error) {
      console.error('Update error:', error);
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="product-page">
      <Topbar />
      <Sidebar />
      <div className="product-container">
        <div className="product-header">
          <h2>Edit Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="product-productform">
          {/* Product Fields */}
          <div className="details-grid">
            <div className="productform-group">
              <label>Product Name</label>
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="productform-input" placeholder="Enter product name"/>
            </div>

            <div className="productform-group">
              <label>SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="productform-input" placeholder="Enter SKU"/>
            </div>

            <div className="productform-group">
              <label>Short Name</label>
              <input type="text" name="shortName" value={formData.shortName} onChange={handleChange} className="productform-input" placeholder="Enter short name"/>
            </div>

            <div className="productform-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="productform-input"/>
            </div>

            <div className="productform-group">
              <label>Quantity Alert</label>
              <input type="number" name="quantityAlert" value={formData.quantityAlert} onChange={handleChange} min="0" required className="productform-input"/>
            </div>

            <div className="productform-group">
              <label>Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="productform-select">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
              </select>
            </div>

            <div className="productform-group">
              <label>Brand</label>
              <select name="brandId" value={formData.brandId} onChange={handleChange} required className="productform-select">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.brandId} value={b.brandId}>{b.brandName}</option>)}
              </select>
            </div>

            <div className="productform-group">
              <label>Barcode Type</label>
              <select name="barcodeId" value={formData.barcodeId} onChange={handleChange} required className="productform-select">
                <option value="">Select Barcode Type</option>
                {barcodes.map(b => <option key={b.barcodeId} value={b.barcodeId}>{b.barcodeType}</option>)}
              </select>
            </div>

            <div className="productform-group">
              <label>Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="productform-input"/>
              {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Product Preview"/></div>}
            </div>
          </div>

          {/* Description */}
          <div className="productform-group">
            <label>Description</label>
            <textarea name="productDescription" value={formData.productDescription} onChange={handleChange} className="productform-textarea" placeholder="Enter product description"></textarea>
          </div>

          {/* Discounts */}
          <div className="productform-group">
            <label>Discounts</label>
            <select value={selectedDiscountCode} onChange={handleDiscountCodeChange} className="productform-select">
              <option value="">Select Discount Code</option>
              {discountCodes.map(dc => <option key={dc.discountId} value={dc.discountCode}>{dc.discountCode}</option>)}
            </select>

            <table className="product-table">
              <thead>
                <tr>
                  <th>Discount Code</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.code}</td>
                    <td>
                      <button type="button" className="delete-btn" onClick={() => handleRemoveDiscount(d)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="product-actions">
            <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Update Product</button>
            <button type="button" className="btn btn-secondary" onClick={async () => {
              if (!state?.product?.productId) return alert("Invalid product ID.");
              await addProductDiscount(state.product.productId, discounts);
              const savedDiscounts = await getProductDiscounts(state.product.productId);
              setDiscounts(savedDiscounts);
              await fetchProducts();
              alert("Discounts applied successfully!");
              navigate('/product/list');
            }}><i className="fas fa-tag"></i> Apply Discount</button>
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
